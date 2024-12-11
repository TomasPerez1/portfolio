import ProyectCard from "./ProyectCard";
import cloudinary from "@public/skills/cloudinary-icon.svg";
import express from "@public/skills/express.svg";
import framer from "@public/skills/framer.svg";
import nestjs from "@public/skills/nestjs.svg";
import nextjs from "@public/skills/nextjs-icon.svg";
import prisma from "@public/skills/prisma.svg";
import react from "@public/skills/react.svg";
import tailwind from "@public/skills/tailwindcss-icon.svg";
import typescript from "@public/skills/typescript-icon.svg";
import sequelize from "@public/skills/sequelize.svg";

export default function Proyects() {
  console.log(cloudinary, "svgs");
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
        "Desarrollé una aplicación para un cliente especializado en la creación de libros de fotos para eventos. Laaplicación permite al administrador generar enlaces personalizados para los usuarios, quienes pueden cargar sus fotos desde la web, combinarlas con las de otros usuarios, y seleccionar el orden de impresión para la creación del libro. El administrador podra manejar sus clientes, el estado de los links y descargar las fotos comprimidas",
      github: "https://github.com/ramirofazio/my-fotolibro",
      imgs: [
        "https://nextui.org/images/hero-card-complete.jpeg",
        "https://nextui.org/images/hero-card-complete.jpeg",
        "https://nextui.org/images/hero-card-complete.jpeg",
        "https://nextui.org/images/hero-card-complete.jpeg",
      ],
      skills: [react, tailwind, express, cloudinary],
    },
    {
      id: 2,
      name: "My fotolibro web",
      description:
        "Desarrollé una aplicación para un cliente especializado en la creación de libros de fotos para eventos. Laaplicación permite al administrador generar enlaces personalizados para los usuarios, quienes pueden cargar sus fotos desde la web, combinarlas con las de otros usuarios, y seleccionar el orden de impresión para la creación del libro. El administrador podra manejar sus clientes, el estado de los links y descargar las fotos comprimidas",
      github: "https://github.com/ramirofazio/my-fotolibro",
      imgs: [
        "https://nextui.org/images/hero-card-complete.jpeg",
        "https://nextui.org/images/hero-card-complete.jpeg",
        "https://nextui.org/images/hero-card-complete.jpeg",
      ],
      skills: [cloudinary, express, react],
    },
    {
      id: 3,
      name: "My fotolibro web",
      description:
        "Desarrollé una aplicación para un cliente especializado en la creación de libros de fotos para eventos. Laaplicación permite al administrador generar enlaces personalizados para los usuarios, quienes pueden cargar sus fotos desde la web, combinarlas con las de otros usuarios, y seleccionar el orden de impresión para la creación del libro. El administrador podra manejar sus clientes, el estado de los links y descargar las fotos comprimidas",
      github: "https://github.com/ramirofazio/my-fotolibro",
      imgs: [
        "https://nextui.org/images/hero-card-complete.jpeg",
        "https://nextui.org/images/hero-card-complete.jpeg",
        "https://nextui.org/images/hero-card-complete.jpeg",
      ],
      skills: [cloudinary, express, react],
    },
    {
      id: 4,
      name: "My fotolibro web",
      description:
        "Desarrollé una aplicación para un cliente especializado en la creación de libros de fotos para eventos. Laaplicación permite al administrador generar enlaces personalizados para los usuarios, quienes pueden cargar sus fotos desde la web, combinarlas con las de otros usuarios, y seleccionar el orden de impresión para la creación del libro. El administrador podra manejar sus clientes, el estado de los links y descargar las fotos comprimidas",
      github: "https://github.com/ramirofazio/my-fotolibro",
      imgs: [
        "https://nextui.org/images/hero-card-complete.jpeg",
        "https://nextui.org/images/hero-card-complete.jpeg",
        "https://nextui.org/images/hero-card-complete.jpeg",
      ],
      skills: [cloudinary, express, react],
    },
  ];
  return (
    <section id="proyects" className="min-h-screen  ">
      <div className="w-[90%] mx-auto gap-8 grid grid-cols-2 ">
        {proyects.map((proyect, i) => (
          <ProyectCard key={proyect.id} proyect={proyect} />
        ))}
      </div>
    </section>
  );
}
