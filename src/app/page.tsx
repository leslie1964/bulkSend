'use client';
import { useState } from 'react';
import Head from 'next/head';
import { FormData, BulkEmailResponse, EmailRecipient } from '../../types/email';

export default function Home() {
  const [formData, setFormData] = useState<FormData>({
    recipients: '',
    subject: '',
    message: '',
    senderName: ''
  });
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [results, setResults] = useState<BulkEmailResponse | null>(null);
  const [showResults, setShowResults] = useState<boolean>(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setResults(null);

    // Parse recipients (split by comma, semicolon, or newline)
    const recipients = formData.recipients
      .split(/[,;\n]/)
      .map(email => email.trim())
      .filter(email => email && email.includes('@'));

    if (recipients.length === 0) {
      alert('Please enter at least one valid email address');
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch('/api/send-bulk-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          recipients,
          subject: formData.subject,
          message: formData.message,
          senderName: formData.senderName
        }),
      });

      const data: BulkEmailResponse = await response.json();
      
      if (response.ok) {
        setResults(data);
        setShowResults(true);
      } else {
        alert(`Error: ${data.message || 'Unknown error occurred'}`);
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      alert(`Error: ${errorMessage}`);
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = (): void => {
    setFormData({
      recipients: '',
      subject: '',
      message: '',
      senderName: ''
    });
    setResults(null);
    setShowResults(false);
  };

  const failedEmails: EmailRecipient[] = results?.results?.filter(result => result.status === 'failed') || [];

  return (
    <>
      <Head>
        <title>Bulk Email Sender</title>
        <meta name="description" content="Send bulk emails using Gmail" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h1 className="text-3xl font-bold text-gray-900 mb-8 text-center">
              📧 Bulk Email Sender
            </h1>

            {!showResults ? (
              <form onSubmit={handleSubmit} className="space-y-6 text-black">
                {/* Sender Name */}
                <div>
                  <label htmlFor="senderName" className="block text-sm font-medium text-gray-700 mb-2">
                    Sender Name (Optional)
                  </label>
                  <input
                    type="text"
                    id="senderName"
                    name="senderName"
                    value={formData.senderName}
                    onChange={handleInputChange}
                    placeholder="Your Name or Company"
                    className="w-full px-3 py-2 border  border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                {/* Recipients */}
                <div>
                  <label htmlFor="recipients" className="block text-sm font-medium text-gray-700 mb-2">
                    Recipients *
                  </label>
                  <textarea
                    id="recipients"
                    name="recipients"
                    value={formData.recipients}
                    onChange={handleInputChange}
                    placeholder="Enter email addresses separated by commas, semicolons, or new lines&#10;Example:&#10;user1@example.com&#10;user2@example.com, user3@example.com"
                    rows={6}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <p className="text-sm text-gray-500 mt-1">
                    Separate multiple emails with commas, semicolons, or new lines
                  </p>
                </div>

                {/* Subject */}
                <div>
                  <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-2">
                    Subject *
                  </label>
                  <input
                    type="text"
                    id="subject"
                    name="subject"
                    value={formData.subject}
                    onChange={handleInputChange}
                    placeholder="Email subject line"
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                {/* Message */}
                <div>
                  <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">
                    Message *
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    value={formData.message}
                    onChange={handleInputChange}
                    placeholder="Your email message (HTML supported)"
                    rows={8}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <p className="text-sm text-gray-500 mt-1">
                    HTML formatting is supported
                  </p>
                </div>

                {/* Submit Button */}
                <div className="flex justify-center">
                  <button
                    type="submit"
                    disabled={isLoading}
                    className={`px-8 py-3 rounded-md text-white font-medium ${
                      isLoading
                        ? 'bg-gray-400 cursor-not-allowed'
                        : 'bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500'
                    }`}
                  >
                    {isLoading ? 'Sending...' : 'Send Bulk Email'}
                  </button>
                </div>
              </form>
            ) : (
              /* Results Display */
              <div className="space-y-6">
                <div className="bg-green-50 border border-green-200 rounded-md p-4">
                  <h2 className="text-lg font-semibold text-green-800 mb-2">
                    📊 Sending Results
                  </h2>
                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-blue-600">
                        {results?.summary?.total || 0}
                      </div>
                      <div className="text-gray-600">Total</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-600">
                        {results?.summary?.successful || 0}
                      </div>
                      <div className="text-gray-600">Successful</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-red-600">
                        {results?.summary?.failed || 0}
                      </div>
                      <div className="text-gray-600">Failed</div>
                    </div>
                  </div>
                </div>

                {/* Detailed Results - Only show failed emails */}
                {(results?.summary?.failed || 0) > 0 && (
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800 mb-4">
                      Failed Emails ({results?.summary?.failed})
                    </h3>
                    <div className="max-h-96 overflow-y-auto border border-gray-200 rounded-md">
                      {failedEmails.map((result, index) => (
                        <div
                          key={index}
                          className="px-4 py-3 border-b border-gray-100 flex justify-between items-center bg-red-50"
                        >
                          <span className="font-medium text-red-800">{result.email}</span>
                          <div className="flex items-center space-x-2">
                            <span className="px-2 py-1 rounded text-xs font-medium bg-red-100 text-red-800">
                              ❌ Failed
                            </span>
                            {result.error && (
                              <span 
                                className="text-xs text-red-600 cursor-help" 
                                title={result.error}
                              >
                                ℹ️
                              </span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                    <p className="text-sm text-gray-600 mt-2">
                      💡 Only failed emails are shown for privacy. All successful emails were sent without displaying recipient details.
                    </p>
                  </div>
                )}

                {(results?.summary?.failed === 0) && (
                  <div className="text-center py-8">
                    <div className="text-6xl mb-4">🎉</div>
                    <h3 className="text-xl font-semibold text-green-800 mb-2">
                      All Emails Sent Successfully!
                    </h3>
                    <p className="text-gray-600">
                      All {results?.summary?.successful} emails were delivered successfully. 
                      Recipient details are hidden for privacy.
                    </p>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex justify-center space-x-4">
                  <button
                    onClick={resetForm}
                    className="px-6 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500"
                  >
                    Send Another Email
                  </button>
                </div>
              </div>
            )}

            {/* Setup Instructions */}
            <div className="mt-8 bg-blue-50 border border-blue-200 rounded-md p-4">
              <h3 className="font-semibold text-blue-800 mb-2">Setup Instructions:</h3>
              <ol className="text-sm text-blue-700 space-y-1 list-decimal list-inside">
                <li>Enable 2-factor authentication on your Google account</li>
                <li>Generate an App Password in Google Account settings</li>
                <li>Create a .env.local file with GMAIL_USER and GMAIL_APP_PASSWORD</li>
                <li>Install dependencies: npm install</li>
                <li>Run the development server: npm run dev</li>
              </ol>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}