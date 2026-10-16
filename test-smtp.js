require('dotenv').config();
const nodemailer = require('nodemailer');

const host = process.env.SMTP_HOST || 'smtp.gmail.com';
const port = Number(process.env.SMTP_PORT) || 587;
const user = process.env.SMTP_USER;
const pass = process.env.SMTP_PASSWORD;
const notifyTo = process.env.SMTP_ORDER_NOTIFY_TO;

console.log('--- VPS SMTP DIAGNOSTIC TEST ---');
console.log(`Host: ${host}`);
console.log(`Port: ${port}`);
console.log(`User: ${user}`);
console.log(`Pass provided: ${Boolean(pass)}`);
console.log(`Target Notify Email: ${notifyTo}`);

if (!user || !pass) {
  console.error('\n❌ ERROR: SMTP_USER or SMTP_PASSWORD is not set in your .env file!');
  process.exit(1);
}

const transporter = nodemailer.createTransport({
  host,
  port,
  secure: port === 465,
  auth: {
    user,
    pass,
  },
  tls: {
    rejectUnauthorized: false,
  },
  connectionTimeout: 10000,
});

async function main() {
  console.log('\nStep 1: Testing connection and credentials (transporter.verify)...');
  try {
    await transporter.verify();
    console.log('✅ Connection to SMTP server verified successfully!');
  } catch (err) {
    console.error('\n❌ SMTP Verification Failed:');
    console.error(`Error Code: ${err.code}`);
    console.error(`Message: ${err.message}`);
    if (err.code === 'ETIMEDOUT' || err.code === 'ECONNREFUSED') {
      console.error('\n👉 DIAGNOSIS: Outbound SMTP port is blocked by your VPS provider or firewall.');
      console.error('Try changing SMTP_PORT=465 in your .env file.');
    } else if (err.code === 'EAUTH') {
      console.error('\n👉 DIAGNOSIS: Authentication failed.');
      console.error('Please verify SMTP_USER and Google App Password (SMTP_PASSWORD) in .env.');
    }
    return;
  }

  if (!notifyTo) {
    console.log('\n⚠️ SMTP_ORDER_NOTIFY_TO is not set in .env. Skipping test email send.');
    return;
  }

  console.log(`\nStep 2: Sending test email to ${notifyTo}...`);
  try {
    const info = await transporter.sendMail({
      from: process.env.SMTP_FROM || user,
      to: notifyTo,
      subject: 'Backbone VPS SMTP Diagnostic Test',
      html: '<p>This is a test email sent from the VPS SMTP diagnostic tool. Your email configuration is working!</p>',
    });
    console.log('✅ Test email sent successfully!');
    console.log(`Message ID: ${info.messageId}`);
    console.log(`Accepted: ${info.accepted?.join(', ')}`);
  } catch (err) {
    console.error('\n❌ Sending Test Email Failed:');
    console.error(err);
  }
}

main();
