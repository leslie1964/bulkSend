export interface EmailRecipient {
  email: string;
  status: 'success' | 'failed';
  messageId?: string;
  error?: string;
}

export interface BulkEmailRequest {
  recipients: string[];
  subject: string;
  message: string;
  senderName?: string;
}

export interface BulkEmailResponse {
  message: string;
  results: EmailRecipient[];
  summary: {
    total: number;
    successful: number;
    failed: number;
  };
}

export interface FormData {
  recipients: string;
  subject: string;
  message: string;
  senderName: string;
}

