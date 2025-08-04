// src/utils/email.templates.ts
export function buildOtpEmailTemplate(
  otp: string,
  action: 'emailVerification' | 'passwordReset',
) {
  const isVerification = action === 'emailVerification';
  const brandColor = '#9333ea'; // Purple brand color
  const accentColor = '#ec4899'; // Pink accent color

  const baseHtml = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
       <title>${isVerification ? 'Email Verification' : 'Password Reset'} - CollabSpace</title>
      <style>
        body {
          margin: 0;
          padding: 0;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
          line-height: 1.6;
          color: #374151;
          background-color: #f9fafb;
        }
        .email-container {
          max-width: 600px;
          margin: 0 auto;
          background-color: #ffffff;
          border-radius: 12px;
          overflow: hidden;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
        }
        .header {
          background: linear-gradient(135deg, ${brandColor} 0%, ${accentColor} 50%, #3b82f6 100%);
          padding: 40px 30px;
          text-align: center;
        }
        .logo {
          font-size: 28px;
          font-weight: bold;
          color: white;
          margin: 0;
          text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        }
        .tagline {
          color: rgba(255, 255, 255, 0.9);
          font-size: 14px;
          margin: 8px 0 0 0;
          font-weight: 300;
        }
        .content {
          padding: 40px 30px;
        }
        .greeting {
          font-size: 18px;
          font-weight: 600;
          color: #1f2937;
          margin: 0 0 20px 0;
        }
        .message {
          font-size: 16px;
          color: #4b5563;
          margin: 0 0 30px 0;
          line-height: 1.7;
        }
        .otp-container {
          text-align: center;
          margin: 40px 0;
        }
        .otp-label {
          font-size: 14px;
          color: #6b7280;
          margin-bottom: 12px;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          font-weight: 500;
        }
        .otp-code {
          display: inline-block;
          background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
          color: ${brandColor};
          font-size: 32px;
          font-weight: bold;
          letter-spacing: 8px;
          padding: 20px 30px;
          border-radius: 12px;
          border: 2px solid ${brandColor};
          box-shadow: 0 4px 12px rgba(147, 51, 234, 0.15);
          font-family: 'Courier New', monospace;
        }
        .otp-validity {
          font-size: 13px;
          color: #9ca3af;
          margin-top: 12px;
          font-style: italic;
        }
        .security-note {
          background-color: #fef3c7;
          border-left: 4px solid #f59e0b;
          padding: 16px 20px;
          margin: 30px 0;
          border-radius: 0 8px 8px 0;
        }
        .security-note p {
          margin: 0;
          font-size: 14px;
          color: #92400e;
        }
        .security-note strong {
          color: #78350f;
        }
        .instructions {
          background-color: #f8fafc;
          padding: 20px;
          border-radius: 8px;
          margin: 30px 0;
        }
        .instructions h3 {
          margin: 0 0 12px 0;
          color: #1f2937;
          font-size: 16px;
        }
        .instructions ol {
          margin: 0;
          padding-left: 20px;
          color: #4b5563;
        }
        .instructions li {
          margin-bottom: 8px;
          font-size: 14px;
        }
        .footer {
          background-color: #f9fafb;
          padding: 30px;
          text-align: center;
          border-top: 1px solid #e5e7eb;
        }
        .signature {
          font-size: 16px;
          color: #374151;
          margin: 0 0 20px 0;
        }
        .company-info {
          font-size: 13px;
          color: #6b7280;
          line-height: 1.5;
        }
        .social-links {
          margin: 20px 0 0 0;
        }
        .social-links a {
          display: inline-block;
          margin: 0 8px;
          color: ${brandColor};
          text-decoration: none;
          font-size: 12px;
          font-weight: 500;
        }
        .divider {
          height: 1px;
          background: linear-gradient(90deg, transparent 0%, #e5e7eb 50%, transparent 100%);
          margin: 30px 0;
        }
        @media only screen and (max-width: 600px) {
          .email-container {
            margin: 0;
            border-radius: 0;
          }
          .header, .content, .footer {
            padding: 30px 20px;
          }
          .otp-code {
            font-size: 28px;
            letter-spacing: 6px;
            padding: 18px 25px;
          }
        }
      </style>
    </head>
    <body>
      <div class="email-container">
        <!-- Header -->
        <div class="header">
        <h1 class="logo">📎 CollabSpace</h1>
        <p class="tagline">Collaborate. Create. Succeed.</p>
        </div>

        <!-- Content -->
        <div class="content">
          <h2 class="greeting">Hello there! 👋</h2>
          
          <p class="message">
            ${
              isVerification
                ? 'Welcome to CollabSpace! To complete your signup and start collaborating in real time, please verify your email using the code below.'
                : 'We received a request to reset your password for your CollabSpace account. Use the verification code below to proceed.'
            }
          </p>

          <!-- OTP Section -->
          <div class="otp-container">
            <div class="otp-label">${isVerification ? 'Verification Code' : 'Reset Code'}</div>
            <div class="otp-code">${otp}</div>
            <div class="otp-validity">This code expires in 15 minutes</div>
          </div>

          <!-- Instructions -->
          <div class="instructions">
            <h3>${isVerification ? 'How to verify your email:' : 'How to reset your password:'}</h3>
            <ol>
              <li>${isVerification ? 'Copy the verification code above' : 'Copy the reset code above'}</li>
              <li>Return to the ${isVerification ? 'verification' : 'password reset'} page</li>
              <li>Paste the code in the required field</li>
              <li>${isVerification ? 'Click "Verify Email" to complete your registration' : 'Enter your new password and confirm'}</li>
            </ol>
          </div>

          ${
            !isVerification
              ? `
          <div class="security-note">
            <p><strong>Security Notice:</strong> If you didn't request this password reset, please ignore this email and consider updating your account security settings. Your password will remain unchanged.</p>
          </div>
          `
              : `
          <div class="security-note">
            <p><strong>Security Notice:</strong> This verification code is unique to your account. Never share it with anyone, and only enter it on the official ColabSpace website.</p>
          </div>
          `
          }

          <div class="divider"></div>

          <p style="font-size: 14px; color: #6b7280; margin: 0;">
            Having trouble? Reply to this email or contact our support team at 
            <a href="mailto:support@colabspace.com" style="color: ${brandColor}; text-decoration: none;">support@colabspace.com</a>
          </p>
        </div>

        <!-- Footer -->
        <div class="footer">
        <p class="signature">
        Best,<br>
        <strong>The CollabSpace Team</strong>
        </p>
        <div class="company-info">
        <p>CollabSpace - Work Together, Smarter<br>
        Remote HQ | support@collabspace.com</p>
        </div>
        <div class="social-links">
        <a href="#">Website</a> •
        <a href="#">Twitter</a> •
        <a href="#">LinkedIn</a> •
        <a href="#">Help Center</a>
        </div>
        </div>
      </div>
    </body>
    </html>
  `;

  return {
    subject: isVerification
      ? '📎 Welcome to CollabSpace – Verify Your Email'
      : '🔐 CollabSpace Password Reset Code',
    html: baseHtml,
  };
}
