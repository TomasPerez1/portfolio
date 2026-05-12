import nodemailer from "nodemailer";
import type { EmailData } from "./types";

const { EMAIL_PASSWORD, EMAIL_USER, OWNER_EMAIL } = process.env;

export async function POST(request: Request) {
  try {
    const body: EmailData = await request.json();
    const { name, email, subject, message } = body;

    if (!name || !email || !subject || !message) {
      return Response.json({ error: "Missing required fields" }, { status: 400 });
    }

    const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 465,
      secure: true,
      auth: {
        user: EMAIL_USER,
        pass: EMAIL_PASSWORD,
      },
    });

    const info = await transporter.sendMail({
      from: `"Portfolio · ${name}" <${EMAIL_USER}>`,
      to: OWNER_EMAIL ?? "tomas.perez.developer@gmail.com",
      replyTo: email,
      subject,
      text: `${message}\n\n— ${name} <${email}>`,
      html: `
        <h2>${name}</h2>
        <p><a href="mailto:${email}">${email}</a></p>
        <hr/>
        <p style="white-space:pre-wrap">${message}</p>
      `,
    });

    return Response.json({ ok: true, id: info.messageId });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return Response.json({ error: message }, { status: 500 });
  }
}
