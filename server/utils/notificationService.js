const nodemailer = require('nodemailer');

// In-memory notification log for easy inspection and UI display
const notificationLogs = [];

/**
 * Configure Nodemailer transporter (uses SMTP if provided, else mock transport)
 */
let transporter = null;

const getTransporter = async () => {
  if (transporter) return transporter;

  if (process.env.SMTP_HOST && process.env.SMTP_USER) {
    transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT || 587,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  } else {
    // Generate testing ethereal account if in simulation mode
    try {
      const testAccount = await nodemailer.createTestAccount();
      transporter = nodemailer.createTransport({
        host: 'smtp.ethereal.email',
        port: 587,
        secure: false,
        auth: {
          user: testAccount.user,
          pass: testAccount.pass,
        },
      });
    } catch {
      transporter = null; // graceful fallback to console logger
    }
  }

  return transporter;
};

/**
 * Send an Email notification to Visitor or Host
 */
const sendEmail = async ({ to, subject, htmlText, plainText }) => {
  const logEntry = {
    id: 'NOTIF-' + Date.now(),
    type: 'EMAIL',
    recipient: to,
    subject,
    preview: plainText || subject,
    sentAt: new Date(),
    status: 'Delivered',
  };

  notificationLogs.unshift(logEntry);
  if (notificationLogs.length > 50) notificationLogs.pop();

  console.log(`\n📧 [EMAIL NOTIFICATION] To: ${to}`);
  console.log(`   Subject: ${subject}`);
  console.log(`   Content: ${plainText || 'HTML content sent'}\n`);

  try {
    const mailer = await getTransporter();
    if (mailer) {
      const info = await mailer.sendMail({
        from: '"Visitor Pass System" <no-reply@visitorpass.system>',
        to,
        subject,
        text: plainText,
        html: htmlText,
      });
      if (info && info.messageId) {
        logEntry.messageId = info.messageId;
        const previewUrl = nodemailer.getTestMessageUrl(info);
        if (previewUrl) {
          logEntry.previewUrl = previewUrl;
          console.log(`   [Email Preview URL]: ${previewUrl}`);
        }
      }
    }
  } catch (error) {
    console.log(`   [Email Simulation Note] Nodemailer transport note: ${error.message} (Notification captured in system log)`);
  }

  return logEntry;
};

/**
 * Send an SMS notification simulation
 */
const sendSMS = async ({ to, message }) => {
  const logEntry = {
    id: 'SMS-' + Date.now(),
    type: 'SMS',
    recipient: to,
    subject: 'SMS Alert',
    preview: message,
    sentAt: new Date(),
    status: 'Delivered',
  };

  notificationLogs.unshift(logEntry);
  if (notificationLogs.length > 50) notificationLogs.pop();

  console.log(`\n📱 [SMS NOTIFICATION] To: ${to}`);
  console.log(`   Message: ${message}\n`);

  return logEntry;
};

/**
 * Get recent system notifications
 */
const getRecentNotifications = () => {
  return notificationLogs;
};

module.exports = {
  sendEmail,
  sendSMS,
  getRecentNotifications,
};
