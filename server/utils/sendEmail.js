const nodemailer = require('nodemailer');

/**
 * Send an email (supports text and html)
 * @param {string} to
 * @param {string} subject
 * @param {string} [text]
 * @param {string} [html]
 */


/**
 * Send an email (supports text and html and attachments)
 * @param {string} to
 * @param {string} subject
 * @param {string} [text]
 * @param {string} [html]
 * @param {Array} [attachments] - Array of attachment objects as per nodemailer docs
 */
const sendEmail = async (to, subject, text, html, attachments) => {
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    }
  });

  const mailOptions = {
    from: `"iERP Support" <${process.env.EMAIL_USER}>`,
    to,
    subject,
    attachments,
  };
  if (text) mailOptions.text = text;
  if (html) mailOptions.html = html;

  await transporter.sendMail(mailOptions);
};

module.exports = sendEmail;
