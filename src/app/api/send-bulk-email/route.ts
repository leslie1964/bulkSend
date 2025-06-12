import { NextRequest, NextResponse } from 'next/server';
import nodemailer from 'nodemailer';
import { BulkEmailRequest, BulkEmailResponse, EmailRecipient } from '../../../../types/email';

export async function POST(req: NextRequest) {
  try {
    const body: BulkEmailRequest = await req.json();
    const { recipients, subject, message, senderName } = body;

    if (!recipients || !subject || !message) {
      return NextResponse.json(
        { message: 'Missing required fields' },
        { status: 400 }
      );
    }

    if (!process.env.GMAIL_USER || !process.env.GMAIL_APP_PASSWORD) {
      return NextResponse.json(
        { message: 'Server configuration error: Gmail credentials not found' },
        { status: 500 }
      );
    }

    // Create transporter using Gmail and App Password
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_APP_PASSWORD,
      },
    });

    const results: EmailRecipient[] = [];

    // Send emails one by one to avoid rate limiting
    for (const recipient of recipients) {
      try {
        const mailOptions = {
          from: senderName
            ? `${senderName} <${process.env.GMAIL_USER}>`
            : process.env.GMAIL_USER,
          to: recipient.trim(),
          subject: subject,
          html: message,
          text: message.replace(/<[^>]*>/g, ''), // Strip HTML for text version
        };

        const info = await transporter.sendMail(mailOptions);
        results.push({
          email: recipient,
          status: 'success',
          messageId: info.messageId
        });

        // Add small delay to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 100));

      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        results.push({
          email: recipient,
          status: 'failed',
          error: errorMessage
        });
      }
    }

    const successCount = results.filter(r => r.status === 'success').length;
    const failedCount = results.filter(r => r.status === 'failed').length;

    const response: BulkEmailResponse = {
      message: `Bulk email completed. ${successCount} sent, ${failedCount} failed.`,
      results,
      summary: {
        total: recipients.length,
        successful: successCount,
        failed: failedCount
      }
    };

    return NextResponse.json(response);

  } catch (error) {
    console.error('Bulk email error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      {
        message: 'Failed to send bulk emails',
        error: errorMessage
      },
      { status: 500 }
    );
  }
}