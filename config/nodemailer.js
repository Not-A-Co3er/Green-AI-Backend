// This file configures and initializes Nodemailer so the backend can send emails
// such as OTP verification mails, password reset emails, and notifications.
// The transporter created here is reused across the project to avoid repeated setup.

import nodemailer from 'nodemailer';  
// Import Nodemailer library to enable sending emails from the backend.

// Create and configure a reusable transporter object for sending emails
const transporter = nodemailer.createTransport({
  host: 'smtp-relay.brevo.com',          // SMTP host of the email provider (Brevo / SendinBlue)
  port: 587,                             // Standard port commonly used for secure TLS email delivery
  auth: {
    user: process.env.SMTP_USER,         // SMTP username stored in environment variables (.env)
    pass: process.env.SMTP_PASS,         // SMTP password / API key stored in environment variables (.env)
  }
});

// Export the transporter so other files can send emails by reusing this same configuration
export default transporter;
