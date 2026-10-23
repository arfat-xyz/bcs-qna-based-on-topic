import 'dotenv/config';
import nodemailer from 'nodemailer';
import type { MailOptions } from 'nodemailer/lib/json-transport';

// Comprehensive blocklist of common disposable / temporary email domains
export const DISPOSABLE_DOMAINS = new Set([
  'mailinator.com',
  'tempmail.com',
  'temp-mail.org',
  '10minutemail.com',
  'guerrillamail.com',
  'guerrillamail.net',
  'guerrillamail.biz',
  'throwawaymail.com',
  'yopmail.com',
  'yopmail.fr',
  'yopmail.net',
  'sharklasers.com',
  'getairmail.com',
  'dispostable.com',
  'fakeinbox.com',
  'trashmail.com',
  'trashmail.net',
  'maildrop.cc',
  'getnada.com',
  'inboxkitten.com',
  'crazymailing.com',
  'mohmal.com',
  'tempmailaddress.com',
  'burnermail.io',
  'generator.email',
  'fakemailgenerator.com',
  'nada.ltd',
]);

// Obvious spam / placeholder patterns
const SPAM_PATTERNS = [
  /^test@test\./i,
  /^admin@admin\./i,
  /^user@user\./i,
  /^a@a\./i,
  /^asdf@/i,
  /^123456@/i,
  /^noreply@/i,
  /^no-reply@/i,
];

// Simple in-memory rate limiter per IP / identifier: max 5 requests per 10 minutes
const rateLimitMap = new Map<string, { count: number; expiresAt: number }>();

export function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(ip);

  if (!entry || now > entry.expiresAt) {
    rateLimitMap.set(ip, { count: 1, expiresAt: now + 10 * 60 * 1000 });
    return true;
  }

  if (entry.count >= 5) {
    return false;
  }

  entry.count += 1;
  return true;
}

export interface EmailSubmission {
  email: string;
  subject: string;
  name?: string;
  honeypot?: string;
  startTime?: number;
  formStartTime?: number;
}

export interface ValidationResult {
  valid: boolean;
  error?: string;
}

export function validateSubmission(data: EmailSubmission): ValidationResult {
  const { email, subject, honeypot } = data;
  const timing = data.startTime || data.formStartTime;

  // 1. Honeypot check: Bots auto-fill hidden input fields
  if (honeypot && honeypot.trim().length > 0) {
    // Silently return success-like or generic error for bots
    return { valid: false, error: 'Spam detected via bot trap.' };
  }

  // 2. Submission timing check: Humans take at least 1.5 seconds to fill and click
  if (timing && typeof timing === 'number') {
    const elapsed = Date.now() - timing;
    if (elapsed < 1500) {
      return { valid: false, error: 'Submission was too fast. Please try again.' };
    }
  }

  // 3. Email presence & trimming
  if (!email || typeof email !== 'string') {
    return { valid: false, error: 'Email address is required.' };
  }
  const cleanEmail = email.trim().toLowerCase();

  // 4. Strict RFC-compliant email regex
  const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/;
  if (!emailRegex.test(cleanEmail)) {
    return { valid: false, error: 'Please provide a valid email address.' };
  }

  // 5. Check domain and disposable domain list
  const domainPart = cleanEmail.split('@')[1];
  if (!domainPart || !domainPart.includes('.')) {
    return { valid: false, error: 'Email domain is invalid.' };
  }

  const tld = domainPart.split('.').pop();
  if (!tld || tld.length < 2) {
    return { valid: false, error: 'Email domain extension is invalid.' };
  }

  if (DISPOSABLE_DOMAINS.has(domainPart)) {
    return {
      valid: false,
      error: 'Temporary/disposable email domains are not accepted. Please use your real email.',
    };
  }

  // 6. Check common spam patterns
  for (const pattern of SPAM_PATTERNS) {
    if (pattern.test(cleanEmail)) {
      return { valid: false, error: 'Please enter a genuine, personal email address.' };
    }
  }

  // 7. Subject / Message character count validation (30 - 1000 characters)
  if (!subject || typeof subject !== 'string') {
    return { valid: false, error: 'Please enter your message.' };
  }

  const charCount = subject.trim().length;
  if (charCount < 30) {
    return {
      valid: false,
      error: `Message is too short (${charCount} characters). Please write at least 30 characters.`,
    };
  }

  if (charCount > 1000) {
    return {
      valid: false,
      error: `Message exceeds the 1,000-character limit (${charCount} characters). Please shorten your message.`,
    };
  }

  return { valid: true };
}

/**
 * Creates and returns the Nodemailer transporter using Gmail
 */
export function getMailTransporter() {
  const user = process.env.GMAIL_EMAIL;
  const pass = process.env.GMAIL_PASSWORD;

  if (!user || !pass) {
    throw new Error('GMAIL_EMAIL and GMAIL_PASSWORD environment variables are not configured.');
  }

  return nodemailer.createTransport({
    service: 'Gmail',
    auth: { user, pass },
  });
}

/**
 * Sends notification email to Arfat's Gmail
 */
export async function sendContactEmail(submission: EmailSubmission, clientIp?: string) {
  const transporter = getMailTransporter();
  const to = process.env.NODEMAILER_TO || process.env.GMAIL_EMAIL || 'arfatrahman08@gmail.com';
  const from = process.env.NODEMAILER_FROM || process.env.GMAIL_EMAIL;

  const timestamp = new Date().toLocaleString('en-US', {
    timeZone: 'Asia/Dhaka',
    dateStyle: 'full',
    timeStyle: 'medium',
  });

  const htmlContent = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8" />
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f4f6f9; margin: 0; padding: 24px; color: #1e293b; }
          .container { max-width: 580px; margin: 0 auto; background: #ffffff; border-radius: 16px; border: 1px solid #e2e8f0; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05); }
          .header { background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%); padding: 28px 24px; color: #ffffff; text-align: center; }
          .header h1 { margin: 0; font-size: 20px; font-weight: 800; letter-spacing: -0.02em; }
          .header p { margin: 6px 0 0; font-size: 13px; opacity: 0.9; }
          .content { padding: 28px 24px; }
          .field-card { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 14px 16px; margin-bottom: 16px; }
          .field-label { font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; color: #64748b; margin-bottom: 4px; }
          .field-value { font-size: 15px; font-weight: 600; color: #0f172a; word-break: break-word; }
          .footer { padding: 16px 24px; background: #f1f5f9; text-align: center; font-size: 12px; color: #64748b; border-top: 1px solid #e2e8f0; }
          .badge { display: inline-block; padding: 4px 10px; border-radius: 9999px; font-size: 11px; font-weight: 700; background: #e0e7ff; color: #4338ca; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <span class="badge">Cognition Study Platform</span>
            <h1>New User Message Received</h1>
            <p>A visitor submitted an email from your website</p>
          </div>
          <div class="content">
            ${submission.name ? `
            <div class="field-card">
              <div class="field-label">Sender Name</div>
              <div class="field-value">${submission.name}</div>
            </div>` : ''}
            <div class="field-card">
              <div class="field-label">Sender Email</div>
              <div class="field-value"><a href="mailto:${submission.email}" style="color: #4f46e5; text-decoration: none;">${submission.email}</a></div>
            </div>
            <div class="field-card">
              <div class="field-label">Subject / Message Content</div>
              <div class="field-value" style="white-space: pre-wrap; font-size: 14px; font-weight: 400; line-height: 1.6;">${submission.subject}</div>
            </div>
            <div class="field-card">
              <div class="field-label">Received At (Dhaka Time)</div>
              <div class="field-value">${timestamp}</div>
            </div>
            ${clientIp ? `
            <div class="field-card">
              <div class="field-label">Client IP</div>
              <div class="field-value" style="font-family: monospace; font-size: 13px;">${clientIp}</div>
            </div>` : ''}
          </div>
          <div class="footer">
            Sent securely via Nodemailer &bull; Cognition &times; Arfatur Rahman Portfolio
          </div>
        </div>
      </body>
    </html>
  `;

  const cleanSubjectPreview = submission.subject.replace(/[\r\n\t]+/g, ' ').trim();
  const subjectSnippet = cleanSubjectPreview.length > 50 ? `${cleanSubjectPreview.slice(0, 50)}...` : cleanSubjectPreview;
  const senderDisplayName = submission.name ? `${submission.name} (${submission.email})` : submission.email;

  const mailOptions: MailOptions = {
    from: `Cognition Platform <${from}>`,
    to,
    replyTo: submission.email,
    subject: `[Cognition Platform] ${submission.name ? `${submission.name}: ` : ''}${subjectSnippet}`,
    text: `New message from: ${senderDisplayName}\n\nMessage:\n${submission.subject}\n\nTime: ${timestamp}`,
    html: htmlContent,
  };

  return transporter.sendMail(mailOptions);
}
