import React, { useEffect, useState } from "react";
import {
  Form,
  Input,
  Select,
  SelectItem,
  Checkbox,
  Button,
  Textarea,
} from "@nextui-org/react";
import axios from "axios";

// Definición del tipo para emailData
interface EmailData {
  name: string;
  email: string;
  subject: string;
  message: string;
}

export default function SendEmail() {
  const [emailData, setEmailData] = useState<EmailData>({
    name: "",
    email: "",
    subject: "",
    message: "",
  });

  const [errors, setErrors] = React.useState({});

  const isValidEmail = (string: string) => {
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return emailRegex.test(string);
  };

  const checkErrors = (data: EmailData) => {
    const { email, message, name, subject } = data;
    const errors = {};
    if (!email?.length) {
      errors["email"] = "Ingrese un email";
    } else if (!isValidEmail(email)) {
      errors["email"] = "Ingrese un email valido";
    }
    if (!name?.length) {
      errors["name"] = "Ingrese su nombre";
    }
    if (!subject?.length) {
      errors["subject"] = "Ingrese un asunto";
    }
    if (!message?.length) {
      errors["message"] = "Escriba el mensaje que desea enviar";
    }
    return errors;
  };

  const onSubmit = async (e) => {
    try {
      e.preventDefault();
      console.log(
        "SUBMITEOOO",
        emailData.name,
        emailData.email,
        emailData.subject,
        emailData.message,
      );

      const result = await axios.post("/api/send", { jaja: "zaractungaa" });

      // setEmailData({
      //   name: "",
      //   email: "",
      //   subject: "",
      //   message: "",
      // });
      // setErrors({});
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <Form
      className="w-full justify-center items-center h-full"
      validationBehavior="native"
      validationErrors={errors}
      onSubmit={onSubmit}
    >
      <div className="flex flex-col gap-4 w-[90%] border-2 ">
        <section className="flex gap-4">
          <Input
            isRequired
            errorMessage={({ validationDetails }) => {
              if (validationDetails.valueMissing) {
                return "Please enter your name";
              } else if (errors["name"]) {
                return errors["name"];
              }
            }}
            label="Name"
            value={emailData.name}
            labelPlacement="outside"
            name="name"
            onValueChange={(value) => {
              setEmailData((prev) => ({ ...prev, name: value }));
              setErrors(checkErrors({ ...emailData, name: value }));
            }}
            placeholder="Enter your name"
          />

          <Input
            label="Subject"
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

        <Input
          isRequired
          errorMessage={({ validationDetails }) => {
            if (validationDetails.valueMissing) {
              return "Please enter your email";
            } else if (errors["email"]) {
              return errors["email"];
            }
          }}
          label="Email"
          labelPlacement="outside"
          name="email"
          value={emailData.email}
          placeholder="Enter your email"
          type="email"
          onValueChange={(value) => {
            setEmailData((prev) => ({ ...prev, email: value }));
            setErrors(checkErrors({ ...emailData, email: value }));
          }}
        />

        <Textarea
          isRequired
          errorMessage={() => {
            if (errors["message"]) {
              return errors["message"];
            }
          }}
          label="Message"
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

        <div className="flex gap-4">
          <Button
            disabled={Object.keys(errors).length && true}
            className="w-full disabled:opacity-20"
            color="primary"
            type="submit"
          >
            Submit
          </Button>
        </div>
      </div>
    </Form>
  );
}
