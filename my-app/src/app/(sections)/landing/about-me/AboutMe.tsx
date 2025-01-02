"use client";
import React from "react";
import { Suspense } from "react";
import Loader from "../../../ui/Loader";
const ProfileCarroucel = React.lazy(() => import("./ProfileCarroucel"));

export default function AboutMe() {
  type Imgs = {
    name: string;
    src: string;
  };
  const imgs: Imgs[] = [
    {
      name: "profile1",
      src: "/profile/cvprofile.jpg",
    },
    {
      name: "profile2",
      src: "/profile/profile_box.jpg",
    },
    {
      name: "profile3",
      src: "/profile/srious1.jpg",
    },
  ];

  return (
    <section id="about-me" className=" min-h-screen  flex">
      <article className="flex flex-col lg:flex-row items-center justify-center  lg:px-10">
        <Suspense fallback={<Loader className="w-[15rem] h-[15rem]" />}>
          <ProfileCarroucel imgs={imgs} autoplay={false} />
        </Suspense>

        <span className="p-4  bg-gray-800 rounded-lg  w-[85%] mx-auto lg:w-[90%]">
          <p>
            Soy Tomás, desarrollador <strong>Full Stack</strong> apasionado por
            la tecnología, el aprendizaje continuo y la creación de soluciones
            innovadoras. Me especializo en diseñar y construir aplicaciones web
            robustas y escalables.
            <br />
            Mi enfoque no solo está en el código, sino también en el impacto que
            las soluciones pueden generar. Combino mi experiencia técnica con
            habilidades interpersonales que me permiten liderar equipos,
            comunicar ideas complejas de manera efectiva y colaborar en entornos
            ágiles bajo la <strong>metodología SCRUM</strong>.
            <br />
            Entre mis habilidades técnicas en el frontend, desarrollo interfaces
            intuitivas y responsivas con{" "}
            <strong>React, Next.js, y Tailwind CSS</strong> para ofrecer
            resultados modernos y funcionales. En el backend, mi enfoque está en
            construir APIs sólidas y seguras con tecnologías como{" "}
            <strong>Node.js, Nest.js, y Express</strong> , siempre
            complementando estas soluciones con bases de datos relacionales bien
            estructuradas utilizando <strong>PostgreSQL/Mysql</strong>, además
            de una ORM como <strong>Prisma/Sequelize</strong> para optimizar el
            flujo de datos.
            <br />
            Mi nivel de inglés es <strong>Upper Intermediate (B2)</strong> me
            permite comunicarme de manera efectiva con equipos internacionales.
            <br />
            Más allá de lo técnico, soy una persona analítica, creativa y
            orientada a la resolución de problemas. Disfruto de los desafíos,
            porque cada uno representa una oportunidad para aprender y crecer,
            tanto en el ámbito profesional como en el personal.
          </p>
        </span>
      </article>
    </section>
  );
}
