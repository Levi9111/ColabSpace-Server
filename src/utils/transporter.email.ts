import nodemailer from 'nodemailer';
import SMTPTransport from 'nodemailer/lib/smtp-transport';

export const transporter =
  (): nodemailer.Transporter<SMTPTransport.SentMessageInfo> => {
    const auth = {
      user: process.env.ADMIN_EMAIL as string,
      pass: process.env.ADMIN_EMAIL_PASS as string,
    };

    const transportOptions: SMTPTransport.Options = {
      host: 'smtp.gmail.com',
      port: 465,
      secure: true,
      auth,
    };

    return nodemailer.createTransport(
      transportOptions,
    ) as nodemailer.Transporter<SMTPTransport.SentMessageInfo>;
  };
