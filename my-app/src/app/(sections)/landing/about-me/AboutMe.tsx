"use client";
import React from "react";
import { Suspense } from "react";
import Loading from "../../../ui/Loading";
const ProfileCarroucel = React.lazy(() => import("./ProfileCarroucel"));

export default function AboutMe() {
  type Imgs = {
    name: string;
    src: string;
  };
  const imgs: Imgs[] = [
    {
      name: "profile1",
      src: "/profile/profile_box.jpg",
    },
    {
      name: "profile2",
      src: "/profile/lentes.jpg",
    },
    {
      name: "profile3",
      src: "/profile/srious.jpg",
    },
  ];

  return (
    <section id="about-me" className=" min-h-screen  flex">
      <article className="flex flex-col lg:flex-row items-center justify-center  lg:px-10">
        <Suspense fallback={<Loading className="w-[15rem] h-[15rem]" />}>
          <ProfileCarroucel imgs={imgs} autoplay={false} />
        </Suspense>

        <span className="p-4  bg-gray-800 rounded-lg  w-[85%] mx-auto lg:w-[90%]">
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
    </section>
  );
}
