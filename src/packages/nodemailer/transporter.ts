import { createTransport } from 'nodemailer';

export const getEmailTransporter = () => {
  const port = Number(process.env.SMTP_PORT) || 587;
  return createTransport({
    host: process.env.SMTP_HOST,
    port,
    secure: port === 465,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASSWORD,
    },
    tls: {
      rejectUnauthorized: false,
    },
  });
};

export const emailTransporter = new Proxy(
  {} as ReturnType<typeof createTransport>,
  {
    get(_target, prop) {
      const transporter = getEmailTransporter();
      const value = (transporter as any)[prop];
      return typeof value === 'function' ? value.bind(transporter) : value;
    },
  },
);

