"use client";
import { ProfileCarroucel } from "./ProfileCarroucel";
import { RiFilePdf2Line } from "@remixicon/react";

export default function AboutMe() {
  type Imgs = {
    name: string;
    src: string;
  };
  const imgs: Imgs[] = [
    {
      name: "web",
      src: "https://res.cloudinary.com/dnxa8khx9/image/upload/v1730993636/scraper/internet2.png",
    },
    {
      name: "wpp",
      src: "https://res.cloudinary.com/dnxa8khx9/image/upload/v1730993636/scraper/wpp.png",
    },
    {
      name: "ig",
      src: "https://res.cloudinary.com/dnxa8khx9/image/upload/v1730993636/scraper/instagram.png",
    },
  ];

  return (
    <section id="about-me" className=" min-h-screen ">
      <article className="flex items-center">
        <ProfileCarroucel imgs={imgs} autoplay={false} />
        <span className="p-4  bg-gray-800 rounded-lg mr-10">
          <p>
            ¿Quién soy? Soy Tomas, desarrollador Full Stack, una persona que su
            entorno y vida profesional iba enfocado al deporte hasta hace un año
            cuando di un giro de 180° y pude encontrar mi lugar en un espacio
            que siempre estuvo presente y me encantaba, el mundo de la
            tecnología. Finalice mis formación como desarrollador Full Stack 👨‍💻
            en soy HENRY llevándome fuertes conocimientos de : . Java Script ‣‣‣
            (React, Redux, Node, Express, Sequelize) . CSS ‣‣‣ (pure css,
            Tailwind) . SQL ‣‣‣ (Postgres sql) . Git workflow . Metodología ágil
            (SCRUM) Me considero una persona con habilidad para administrar una
            sabia toma de decisiones, generar una efectiva resolución de
            problemas, dirigir a mi equipo a los objetivos planteados,
            identificar que espera el cliente como producto y llevarlo a cabo.
            Estoy en busca de un trabajo en tecnología, que me permita seguir
            aprendiendo mas en este hermoso mundo de la programación 🚀.
            Contacto: Email: tomas.perez.developer@gmail.com || GitHub:
            https://github.com/TomasPerez1 Celular: +54 9 2944140001
          </p>
        </span>
      </article>
      <a
        download
        href="/CV_TOMAS_PEREZ_esp.pdf"
        className="w-fit mt-4 p-2 mx-auto  border-[1px] hover:bg-opacity-80 bg-red-600 flex rounded-lg items-center"
      >
        <p>Download CV</p>
        <RiFilePdf2Line className="w-14 h-14 text-white" />
      </a>
    </section>
  );
}
