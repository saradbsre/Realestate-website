import nodemailer from "nodemailer";

const smtpPort =
  Number(
    process.env.SMTP_PORT || 465
  );

export const mailTransporter =
  nodemailer.createTransport({
    host:
      process.env.SMTP_HOST,

    port: 587,

    secure: false, // true for 465, false for other ports

    // requireTLS: true,

    auth: {
      user:
        process.env.SMTP_USER,

      pass:
        process.env.SMTP_PASS,
    },
    tls: {
      rejectUnauthorized: false,
    },
  });