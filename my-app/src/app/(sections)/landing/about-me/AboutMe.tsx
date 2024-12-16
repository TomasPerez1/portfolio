"use client";
import { ProfileCarroucel } from "./ProfileCarroucel";
import {
  RiFilePdf2Line,
  RiLinkedinBoxFill,
  RiFileDownloadLine,
} from "@remixicon/react";
import Image from "next/image";
import github_icon from "@public/skills/github-icon.svg";

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
    <section id="about-me" className=" min-h-screen border-2 ">
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
      <article className="flex gap-10 items-center justify-around pb-2 border-b-[1.5px] w-fit ml-10 mr-auto">
        <a
          target="_blank"
          href="https://github.com/TomasPerez1"
          className="w-fit border-0 p-0 rounded-lg bg-white hover:bg-blue-400"
        >
          <RiLinkedinBoxFill className="w-14 h-14 text-blue-400 hover:text-white transition-colors" />
        </a>
        <a
          target="_blank"
          href="https://github.com/TomasPerez1"
          className="w-fit p-0.5 rounded-full bg-white text-center "
        >
          <Image
            alt="Proyect img"
            className="rounded-xl mx-auto transition-all hover:opacity-90 "
            src={github_icon}
            width={56}
            height={56}
            // fill={true}
          />
        </a>
        <a
          download
          href="/CV_TOMAS_PEREZ_esp.pdf"
          className="w-fit text-center text-lg  gap-1 p-1  border-[1px] hover:brightness-200 transition-colors bg-red-600 flex rounded-lg items-center"
        >
          <p>
            Download <br /> <p>Curriculum </p>
          </p>

          <RiFileDownloadLine className="w-12 h-12 text-white" />
        </a>
      </article>
    </section>
  );
}
