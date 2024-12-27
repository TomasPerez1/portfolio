import React, { useState } from "react";
import axios from "axios";
import { Form, Input, Button, Textarea } from "@nextui-org/react";
import { toast } from "sonner";

// Definición del tipo para emailData
export interface EmailData {
  name: string;
  subject: string;
  message: string;
}

export default function SendEmail() {
  const [emailData, setEmailData] = useState<EmailData>({
    name: "",
    subject: "",
    message: "",
  });

  const [errors, setErrors] = React.useState({});

  const checkErrors = (data: EmailData) => {
    const { message, name, subject } = data;
    const errors = {};
    if (!name?.length) {
      errors["name"] = "Ingrese su nombre";
    }
    // if (!subject?.length) {
    //   errors["subject"] = "Ingrese un asunto";
    // }
    if (!message?.length) {
      errors["message"] = "Escriba el mensaje que desea enviar";
    }
    return errors;
  };

  const onSubmit = async (e) => {
    try {
      e.preventDefault();

      const { name, subject, message } = emailData;

      const result = await axios.post("/api/send", {
        name,
        subject,
        message,
      });

      console.log("RESUL", result);
      toast.success("Email enviado con exito");

      setEmailData({
        name: "",
        subject: "",
        message: "",
      });
      setErrors({});
    } catch (error) {
      setEmailData({
        name: "",
        subject: "",
        message: "",
      });
      toast.error("Error al enviar email");
      console.log(error);
    }
  };

  return (
    <Form
      className="w-full justify-center items-center h-full "
      validationBehavior="native"
      validationErrors={errors}
      onSubmit={onSubmit}
    >
      <div className="flex flex-col gap-4 w-[90%]  ">
        <section className="flex gap-4">
          <Input
            // className="caret-red-600"
            errorMessage={() => {
              if (errors["name"]) {
                return errors["name"];
              }
            }}
            label={
              <p>
                Nombre <strong className="text-red-500">*</strong>
              </p>
            }
            value={emailData.name}
            labelPlacement="outside"
            name="name"
            onValueChange={(value) => {
              setEmailData((prev) => ({ ...prev, name: value }));
            }}
            placeholder="Enter your name"
          />

          <Input
            label="Asunto"
            labelPlacement="outside"
            name="subject"
            placeholder="Subject"
            type="text"
            value={emailData.subject}
            maxLength={50}
            onValueChange={(value) => {
              setEmailData((prev) => ({ ...prev, subject: value }));
              setErrors(checkErrors({ ...emailData, subject: value }));
            }}
          />
        </section>

        {/* <Input
          errorMessage={() => {
            if (errors["email"]) {
              return errors["email"];
            }
          }}
          label={
            <p>
              Email <strong className="text-red-500">*</strong>
            </p>
          }
          labelPlacement="outside"
          name="email"
          value={emailData.email}
          placeholder="Enter your email"
          type="email"
          onValueChange={(value) => {
            setEmailData((prev) => ({ ...prev, email: value }));
            setErrors(checkErrors({ ...emailData, email: value }));
          }}
        /> */}

        <Textarea
          // isRequired
          errorMessage={() => {
            if (errors["message"]) {
              return errors["message"];
            }
          }}
          label={
            <p>
              Mensaje <strong className="text-red-500">*</strong>
            </p>
          }
          minRows={8}
          maxRows={23}
          value={emailData.message}
          labelPlacement="outside"
          name="message"
          onValueChange={(value) => {
            setEmailData((prev) => ({ ...prev, message: value }));
            setErrors(checkErrors({ ...emailData, message: value }));
          }}
          placeholder="Enter a message"
        />

        <Button
          disabled={Object.keys(errors).length && true}
          className="font-mono uppercase w-fit mx-auto px-5 text-2xl disabled:pointer-events-none disabled:opacity-20 bg-violet-800 text-white"
          type="submit"
        >
          Enviar
        </Button>
      </div>
    </Form>
  );
}
