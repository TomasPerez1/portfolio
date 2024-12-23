import { EmailTemplate } from "../../(sections)/landing/contact/EmailTemplate";
import { Resend } from "resend";
import type { EmailData } from "../../(sections)/landing/contact/SendEmail";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: Request) {
  try {
    const body: EmailData = await request.json();
    const { name, email, subject, message } = body;
    const from = `${name || "Anonimo"} <${"contact@tomasperezdev.site"}>`;
    const { data, error } = await resend.emails.send({
      from,
      to: ["tomas.perez.developer@gmail.com"],
      subject: `${subject || "empty"}`,
      react: EmailTemplate({ name, message }),
    });

    if (error) {
      return Response.json(
        { error },
        { status: 500, statusText: error.message },
      );
    }

    return Response.json(data);
  } catch (error) {
    return Response.json({ error }, { status: 500 });
  }
}
