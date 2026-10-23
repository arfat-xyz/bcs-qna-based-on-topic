import type { IncomingMessage, ServerResponse } from 'http';
import {
  validateSubmission,
  sendContactEmail,
  checkRateLimit,
} from '../src/server/email-service';

export default async function handler(req: any, res: any) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.statusCode = 204;
    res.end();
    return;
  }

  if (req.method !== 'POST') {
    res.statusCode = 405;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ success: false, error: 'Method Not Allowed' }));
    return;
  }

  try {
    let body = req.body;
    if (typeof body === 'string') {
      try {
        body = JSON.parse(body);
      } catch (e) {
        res.statusCode = 400;
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify({ success: false, error: 'Invalid JSON body' }));
        return;
      }
    }

    if (!body || typeof body !== 'object') {
      res.statusCode = 400;
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify({ success: false, error: 'Request body required' }));
      return;
    }

    const clientIp =
      (req.headers['x-forwarded-for'] as string) ||
      req.socket?.remoteAddress ||
      'unknown-ip';

    // Rate limiting check
    if (!checkRateLimit(clientIp)) {
      res.statusCode = 429;
      res.setHeader('Content-Type', 'application/json');
      res.end(
        JSON.stringify({
          success: false,
          error: 'Too many requests. Please wait a few minutes before trying again.',
        })
      );
      return;
    }

    // Validation (spam honeypot, timing, disposable domain, regex, subject length)
    const validation = validateSubmission(body);
    if (!validation.valid) {
      // If honeypot caught a bot, give a fake 200 so the bot doesn't retry
      if (validation.error?.includes('bot trap')) {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify({ success: true, message: 'Message received.' }));
        return;
      }

      res.statusCode = 400;
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify({ success: false, error: validation.error }));
      return;
    }

    // Send the email via Gmail SMTP
    await sendContactEmail(body, clientIp);

    res.statusCode = 200;
    res.setHeader('Content-Type', 'application/json');
    res.end(
      JSON.stringify({
        success: true,
        message: 'Your email has been sent successfully! Arfat will be in touch.',
      })
    );
  } catch (err: any) {
    console.error('Email API Error:', err);
    res.statusCode = 500;
    res.setHeader('Content-Type', 'application/json');
    res.end(
      JSON.stringify({
        success: false,
        error: err.message || 'Failed to send email. Please try again later.',
      })
    );
  }
}
