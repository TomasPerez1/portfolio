import { EmailTemplate } from "../../(sections)/landing/contact/EmailTemplate";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { firstName } = body;

    const { data, error } = await resend.emails.send({
      from: "TOMSONIANO <tomixdperez@gmail.com>",
      to: ["tomas.perez.developer@gmail.com"],
      subject: "Hello world",
      react: EmailTemplate({ firstName: "" }),
    });
    console.log("data", data);
    if (error) {
      return Response.json({ error }, { status: 500 });
    }

    return Response.json(body);
  } catch (error) {
    return Response.json({ error }, { status: 500 });
  }
}
