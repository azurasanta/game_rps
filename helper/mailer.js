const fs = require('fs');
const path = require('path');
const nodemailer = require('nodemailer');

const mailer = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.MAILER_USER,
    pass: process.env.MAILER_PASSWORD
  }
});
module.exports = mailer;
const sendEmail = (to, subject, html) =>
  mailer.sendMail({
    from: 'support@rpsbet.io',
    to,
    subject,
    html
  });
module.exports.sendEmail = sendEmail;

const resetPassword = (email, name, changePasswordId) => {
  const template = fs
    .readFileSync(path.resolve(__dirname, '../templates/password-reset.html'))
    .toString();

  return sendEmail(
    email,
    'Password Reset',
    template
      .replace(/{{name}}/g, name)
      .replace(
        /{{action_url}}/,
        `https://rpsbet.io/changePassword/${changePasswordId}`
      )
  );
};

module.exports.resetPassword = resetPassword;
