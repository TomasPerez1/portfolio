// import { EmailTemplate } from "../../(sections)/landing/contact/EmailTemplate";
// const nodemailer = require("nodemailer");
import nodemailer from "nodemailer";
import type { EmailData } from "../../(sections)/landing/contact/SendEmail";
const { EMAIL_PASSWORD, EMAIL_USER } = process.env;

export async function POST(request: Request) {
  try {
    const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 465,
      secure: true,
      auth: {
        user: EMAIL_USER,
        pass: EMAIL_PASSWORD,
      },
    });
    const body: EmailData = await request.json();
    const { name, email, subject, message } = body;

    const info = await transporter.sendMail({
      from: `"🎉 RRHH" <${EMAIL_USER}>`,
      to: "tomas.perez.developer@gmail.com",
      subject: subject,
      text: message,
      html: `
      <h1>${name.toUpperCase()}</h1>
      <hr/>
      <h2>${message}</h2>
      `,
    });

    return Response.json(info);
  } catch (error) {
    return Response.json({ error }, { status: 500 });
  }
}
