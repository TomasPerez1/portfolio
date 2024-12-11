import ProyectCard from "./ProyectCard";
import cloudinary from "@public/skills/cloudinary-icon.svg";
import express from "@public/skills/express.svg";
import framer from "@public/skills/framer.svg";
import nestjs from "@public/skills/nestjs.svg";
import prisma from "@public/skills/prisma.svg";
import react from "@public/skills/react.svg";
import tailwind from "@public/skills/tailwindcss-icon.svg";
import typescript from "@public/skills/typescript-icon.svg";
import sequelize from "@public/skills/sequelize.svg";
import docker from "@public/skills/docker-icon.svg";
import auth0 from "@public/skills/auth0-icon.svg";
import redux from "@public/skills/redux.svg";
import puppeteer from "@public/skills/puppeteer.svg";
import nextjs from "@public/skills/nextjs-icon.svg"; // Todo crear una animacion para que parezca qeu volvi a abrir otra web pero qeu sea este mismo portfolio, utilizando next js

export default function Proyects() {
  type Proyect = {
    id: number;
    name: string;
    description: string;
    github: string;
    imgs: string[];
    skills: string[];
  };
  const proyects: Proyect[] = [
    {
      id: 1,
      name: "My fotolibro web",
      description:
        "Desarrollé una aplicación para un cliente especializado en la creación de libros de fotos para eventos. Laaplicación permite al administrador generar enlaces personalizados para los usuarios, quienes pueden cargar sus fotos desde la web, combinarlas con las de otros usuarios, y seleccionar el orden de impresión para la creación del libro. El administrador podra manejar sus clientes, el estado de los links y descargar las fotos comprimidas.",
      github: "https://github.com/ramirofazio/my-fotolibro",
      imgs: [
        "https://nextui.org/images/hero-card-complete.jpeg",
        "https://nextui.org/images/hero-card-complete.jpeg",
        "https://nextui.org/images/hero-card-complete.jpeg",
        "https://nextui.org/images/hero-card-complete.jpeg",
      ],
      skills: [react, tailwind, express, sequelize, cloudinary],
    },
    {
      id: 2,
      name: "Hydrotek Store",
      description:
        "Con dos devs, desarrollamos un e-commerce con blog integrado, siendo este el primer proyecto llevado a producción. Enfrentamos desafíos significativos, como la integración de un sistema de facturación sin documentación, la gestión de assets a través de un servicio web de terceros, y el despliegue del proyecto, considerando las mejores en Argentina. Durante este proceso, adquirí experiencia valiosa y aprendí Prisma ORM, Nest.js y TypeScript en menos de un mes.",
      github: "https://github.com/ramirofazio/my-fotolibro",
      imgs: [
        "https://nextui.org/images/hero-card-complete.jpeg",
        "https://nextui.org/images/hero-card-complete.jpeg",
        "https://nextui.org/images/hero-card-complete.jpeg",
      ],
      skills: [
        react,
        tailwind,
        redux,
        nestjs,
        prisma,
        typescript,
        auth0,
        docker,
      ],
    },
    {
      id: 3,
      name: "Spotline ecommerce",
      description:
        "E-commerce para metalurgica argentina con gran flujo de clientes y stock, integrando una base de datos con un sistema en un servidor local (SQL server)",
      github: "https://github.com/ramirofazio/my-fotolibro",
      imgs: [
        "https://nextui.org/images/hero-card-complete.jpeg",
        "https://nextui.org/images/hero-card-complete.jpeg",
        "https://nextui.org/images/hero-card-complete.jpeg",
      ],
      skills: [
        react,
        tailwind,
        framer,
        redux,
        nestjs,
        prisma,
        typescript,
        docker,
      ],
    },
    {
      id: 4,
      name: "Property Scraper",
      description:
        "Una aplicación que te permite scrapear propiedades con sus respectivos datos desde Mercado Libre y Zona Prop, guardar las consultas y permite descargar un PDF con las propiedades obtenidas.",
      github: "https://github.com/ramirofazio/my-fotolibro",
      imgs: [
        "https://nextui.org/images/hero-card-complete.jpeg",
        "https://nextui.org/images/hero-card-complete.jpeg",
        "https://nextui.org/images/hero-card-complete.jpeg",
      ],
      skills: [react, tailwind, nestjs, prisma, typescript, puppeteer],
    },
  ];
  return (
    <section id="proyects" className="min-h-screen  ">
      <div className="w-[90%] mx-auto gap-8 grid grid-cols-2 ">
        {/* {proyects.map((proyect, i) => (
          <ProyectCard key={proyect.id} proyect={proyect} />
        ))} */}
        <ProyectCard key={proyects[0].id} proyect={proyects[0]} />
      </div>
    </section>
  );
}
