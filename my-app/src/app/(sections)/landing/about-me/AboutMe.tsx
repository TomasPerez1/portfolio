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
        <Suspense fallback={<Loader className="w-[15rem] h-[15rem]" />}>
          <ProfileCarroucel imgs={imgs} autoplay={false} />
        </Suspense>

        <span className="p-4  bg-gray-800 rounded-lg  w-[85%] mx-auto lg:w-[90%]">
          <p>
            Soy Tomás, desarrollador Full Stack apasionado por la tecnología, el
            aprendizaje continuo y la creación de soluciones innovadoras. Me
            especializo en diseñar y construir aplicaciones web robustas y
            escalables, utilizando tecnologías modernas como Node.js, React,
            Next.js, Redux, Nest.js, Prisma, y PostgreSQL. Mi enfoque no solo
            está en el código, sino también en el impacto que las soluciones
            pueden generar. Combino mi experiencia técnica con habilidades
            interpersonales que me permiten liderar equipos, comunicar ideas
            complejas de manera efectiva y colaborar en entornos ágiles bajo la
            metodología SCRUM. Entre mis habilidades técnicas destacan:
            Frontend: Desarrollo de interfaces intuitivas y responsivas con
            React, Next.js, y Tailwind CSS. Backend: Creación de APIs sólidas y
            seguras con Node.js, Nest.js, y Express, acompañado de un enfoque en
            bases de datos relacionales con PostgreSQL y herramientas como
            Prisma y Sequelize. TypeScript: Garantizando un código limpio,
            tipado y escalable. Control de versiones: Experiencia en flujos de
            trabajo colaborativos con Git y GitHub. Además, mi nivel de inglés
            Upper Intermediate (B2) me permite trabajar cómodamente con equipos
            internacionales, asegurando una comunicación clara y eficiente.
            Fuera del ámbito técnico, soy una persona orientada a la resolución
            de problemas, con capacidad de análisis, pensamiento crítico y
            creatividad para proponer soluciones que realmente aporten valor. Me
            motiva enfrentar desafíos, tanto profesionales como personales, y
            busco constantemente mejorar, aprender y crecer.
          </p>
        </span>
      </article>
    </section>
  );
}
