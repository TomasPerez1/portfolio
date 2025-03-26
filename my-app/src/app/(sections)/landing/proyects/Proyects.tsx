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
import { useTranslation } from "../../../i18n/client";

export default function Proyects({ lang }: { lang: string }) {
  const { t } = useTranslation(lang, "common");

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
      description: t("proyects.myfotolibro.description"),
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
      description: t("proyects.hydrotek.description"),
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
      description: t("proyects.spotsline.description"),
      github: "https://github.com/TomasPerez1/spotsline-frontend",
      imgs: [
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
      description: t("proyects.property-scraper.description"),
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
