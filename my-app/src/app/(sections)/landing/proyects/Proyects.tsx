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
      github: "https://github.com/TomasPerez1/my-fotolibro",
      imgs: [
        "/proyects/myfotolibro/myfotolibro3.jpg",
        "/proyects/myfotolibro/myfotolibro4.jpg",
        "/proyects/myfotolibro/myfotolibro5.jpg",
        "/proyects/myfotolibro/myfotolibro6.jpg",
        "/proyects/myfotolibro/myfotolibro1.jpg",
        "/proyects/myfotolibro/myfotolibro2.jpg",
      ],
      skills: [react, tailwind, express, sequelize, cloudinary],
    },
    {
      id: 2,
      name: "Hydrotek Store",
      description:
        "Con dos devs, desarrollamos un e-commerce con blog integrado, siendo este el primer proyecto llevado a producción. Enfrentamos desafíos significativos, como la integración de un sistema de facturación sin documentación, la gestión de assets a través de un servicio web de terceros, y el despliegue del proyecto, considerando las mejores en Argentina. Durante este proceso, adquirí experiencia valiosa y aprendí Prisma ORM, Nest.js y TypeScript en menos de un mes.",
      github: "https://github.com/TomasPerez1/hydrotek-frontend",
      imgs: [
        "/proyects/hydrotek/hydrotek1.jpg",
        "/proyects/hydrotek/hydrotek5.jpg",
        "/proyects/hydrotek/hydrotek12.jpg",
        "/proyects/hydrotek/hydrotek13.jpg",
        "/proyects/hydrotek/hydrotek8.jpg",
        "/proyects/hydrotek/hydrotek10.jpg",
        "/proyects/hydrotek/hydrotek11.jpg",
        "/proyects/hydrotek/hydrotek3.jpg",
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
      name: "Spotsline ecommerce",
      description:
        "E-commerce para metalurgica argentina con gran flujo de clientes y stock, integrando una base de datos con un sistema en un servidor local (SQL server)",
      github: "https://github.com/TomasPerez1/spotsline-frontend",
      imgs: [
        // "/proyects/spotsline/spot.jpg",
        "/proyects/spotsline/spot1.jpg",
        "/proyects/spotsline/spot2.jpg",
        "/proyects/spotsline/spot3.jpg",
        "/proyects/spotsline/spot4.jpg",
        "/proyects/spotsline/spot18.jpg",
        "/proyects/spotsline/spot5.jpg",
        "/proyects/spotsline/spot6.jpg",
        "/proyects/spotsline/spot7.jpg",
        "/proyects/spotsline/spot8.jpg",
        "/proyects/spotsline/spot14.jpg",
        "/proyects/spotsline/spot9.jpg",
        "/proyects/spotsline/spot10.jpg",
        "/proyects/spotsline/spot11.jpg",
        "/proyects/spotsline/spot12.jpg",
        "/proyects/spotsline/spot13.jpg",
        "/proyects/spotsline/spot15.jpg",
        "/proyects/spotsline/spot16.jpg",
        "/proyects/spotsline/spot17.jpg",
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
      github: "https://github.com/TomasPerez1/property-scraper",
      imgs: [
        "/proyects/scraper/scraper12.jpg",
        "/proyects/scraper/scraper1.jpg",
        "/proyects/scraper/scraper4.jpg",
        "/proyects/scraper/scraper5.jpg",
        "/proyects/scraper/scraper6.jpg",
        "/proyects/scraper/scraper8.jpg",
        "/proyects/scraper/scraper9.jpg",
        "/proyects/scraper/scraper10.jpg",
        "/proyects/scraper/scraper11.jpg",
      ],
      skills: [react, tailwind, nestjs, prisma, typescript, puppeteer],
    },
  ];

  return (
    <section id="proyects" className="min-h-screen  py-4">
      <div className="w-[90%] mx-auto  gap-8 grid grid-cols-1 lg:w-[97%] xl:w-[90%] lg:grid-cols-2 ">
        {proyects.map((proyect) => (
          <ProyectCard key={proyect.id} proyect={proyect} />
        ))}
      </div>
    </section>
  );
}
