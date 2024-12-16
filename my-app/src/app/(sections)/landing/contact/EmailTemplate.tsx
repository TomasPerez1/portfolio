import * as React from "react";

interface EmailTemplateProps {
  name: string;
  message: string;
}

export const EmailTemplate: React.FC<Readonly<EmailTemplateProps>> = ({
  name,
  message,
}) => (
  <div>
    <h1 className="bg-red-500">{name || "Anonimo"} is reaching us!</h1>
    <h2>(via portfolio web)</h2>
    <strong>
      <p
        style={{
          fontSize: "36px",
          lineHeight: "40px",
        }}
      >
        {message}
      </p>
    </strong>
  </div>
);
