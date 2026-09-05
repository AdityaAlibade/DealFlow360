const nodemailer = require('nodemailer');
const config = require('../config');

let transporter = null;

const getTransporter = () => {
  if (transporter) return transporter;

  const isConfigured =
    config.smtp.user &&
    config.smtp.pass &&
    config.smtp.user !== 'email@example.com' &&
    config.smtp.pass !== 'password';

  if (isConfigured) {
    transporter = nodemailer.createTransport({
      host: config.smtp.host,
      port: config.smtp.port,
      secure: config.smtp.secure,
      auth: {
        user: config.smtp.user,
        pass: config.smtp.pass
      }
    });
  } else {
    // In development or when SMTP credentials are not yet configured, use mock stream transport
    transporter = nodemailer.createTransport({
      streamTransport: true,
      newline: 'unix',
      buffer: true
    });
  }

  return transporter;
};

const sendPasswordResetEmail = async ({ to, resetUrl, fullName }) => {
  const mailTransporter = getTransporter();
  const userName = fullName || 'DealFlow360 User';

  const isConfigured =
    config.smtp.user &&
    config.smtp.pass &&
    config.smtp.user !== 'email@example.com' &&
    config.smtp.pass !== 'password';

  const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Reset Your DealFlow360 Password</title>
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f8fafc; margin: 0; padding: 32px 16px; color: #1e293b;">
  <div style="max-width: 560px; margin: 0 auto; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 20px -2px rgba(0, 0, 0, 0.05); border: 1px solid #e2e8f0;">
    
    <!-- Brand Header -->
    <div style="background: linear-gradient(135deg, #a459a8 0%, #7e3b82 100%); padding: 32px 28px; text-align: center;">
      <div style="display: inline-block; width: 44px; height: 44px; line-height: 44px; background: rgba(255, 255, 255, 0.2); border-radius: 12px; color: #ffffff; font-size: 22px; font-weight: 800; margin-bottom: 12px;">
        D
      </div>
      <h1 style="color: #ffffff; margin: 0; font-size: 22px; font-weight: 700; letter-spacing: -0.02em;">
        DealFlow<span style="opacity: 0.9;">360</span>
      </h1>
      <p style="color: rgba(255, 255, 255, 0.8); margin: 6px 0 0; font-size: 12px; text-transform: uppercase; letter-spacing: 0.08em; font-weight: 600;">
        Enterprise Revenue & Deal Operations
      </p>
    </div>

    <!-- Body Content -->
    <div style="padding: 36px 32px;">
      <h2 style="margin: 0 0 16px; font-size: 18px; font-weight: 700; color: #0f172a;">
        Password Reset Request
      </h2>
      <p style="margin: 0 0 20px; font-size: 14px; line-height: 1.6; color: #475569;">
        Hello <strong>${userName}</strong>,
      </p>
      <p style="margin: 0 0 24px; font-size: 14px; line-height: 1.6; color: #475569;">
        We received a request to reset the password for your DealFlow360 account associated with <strong>${to}</strong>. Click the button below to establish a new password:
      </p>

      <!-- CTA Button -->
      <div style="text-align: center; margin: 32px 0;">
        <a href="${resetUrl}" style="display: inline-block; background-color: #a459a8; color: #ffffff; font-size: 14px; font-weight: 700; text-decoration: none; padding: 14px 32px; border-radius: 10px; box-shadow: 0 4px 12px rgba(164, 89, 168, 0.35);">
          Reset Password
        </a>
      </div>

      <!-- Security / Expiry Notice -->
      <div style="background-color: #fdf4ff; border-left: 4px solid #a459a8; border-radius: 6px; padding: 14px 16px; margin: 28px 0 20px;">
        <p style="margin: 0; font-size: 12px; line-height: 1.5; color: #701a75;">
          <strong>Security Notice:</strong> This reset link will automatically expire in <strong>15 minutes</strong>. If you did not request this password reset, please ignore this email or reach out to your system administrator. Your account remains secure.
        </p>
      </div>

      <p style="margin: 24px 0 8px; font-size: 12px; color: #94a3b8;">
        If the button above does not work, copy and paste this link into your browser:
      </p>
      <p style="margin: 0; font-size: 11px; word-break: break-all; color: #a459a8; background: #f8fafc; padding: 10px; border-radius: 6px; border: 1px solid #e2e8f0;">
        <a href="${resetUrl}" style="color: #a459a8; text-decoration: none;">${resetUrl}</a>
      </p>
    </div>

    <!-- Footer -->
    <div style="background-color: #f8fafc; border-top: 1px solid #e2e8f0; padding: 20px 32px; text-align: center;">
      <p style="margin: 0; font-size: 11px; color: #64748b;">
        © ${new Date().getFullYear()} DealFlow360 Enterprise Revenue Intelligence. All rights reserved.
      </p>
    </div>
  </div>
</body>
</html>
  `;

  const mailOptions = {
    from: config.smtp.from,
    to,
    subject: 'DealFlow360 — Reset Your Password',
    text: `Hello ${userName},\n\nA password reset request was received for your DealFlow360 account (${to}).\n\nTo reset your password, visit the following link within the next 15 minutes:\n${resetUrl}\n\nIf you did not request this, please ignore this email.`,
    html: htmlContent
  };

  try {
    const info = await mailTransporter.sendMail(mailOptions);
    if (!isConfigured) {
      console.log(`\n============================================================`);
      console.log(`🔑 [DealFlow360 Password Reset URL (Dev Mode)]`);
      console.log(`Recipient: ${to}`);
      console.log(`Reset Link: ${resetUrl}`);
      console.log(`============================================================\n`);
    } else {
      console.log(`[Email Service] Password reset email sent to ${to} (MessageId: ${info.messageId})`);
    }
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error(`[Email Service Error] Failed to send email to ${to}:`, error.message);
    return { success: false, error: error.message };
  }
};

module.exports = {
  sendPasswordResetEmail
};
