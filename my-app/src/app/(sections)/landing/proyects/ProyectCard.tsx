import {
  Card,
  CardHeader,
  CardBody,
  Accordion,
  AccordionItem,
} from "@nextui-org/react";
import { Carousel } from "./Carousel";
import Image from "next/image";
import github_icon from "@public/skills/github-icon.svg";

export default function ProyectCard({ proyect }) {
  const { id, name, description, github, imgs, skills } = proyect;

  return (
    <Card className="p-0 bg-gray-800 flex-shrink-0 max-h-fit relative max-w-full md:max-w-[550px] lg:max-w-full mx-auto">
      <CardHeader className="px-0.5 flex-col items-start  py-0">
        <Carousel imgs={imgs} />
      </CardHeader>
      <CardBody className="overflow-visible py-0 ">
        <Accordion className="py-0 ">
          <AccordionItem
            key={id}
            startContent={
              <a
                target="_blank"
                href={github}
                className="w-[40px] z-40 p-2 rounded-full"
              >
                <Image
                  alt="Proyect img"
                  className=" p-0.5 rounded-full bg-white text-center  mx-auto transition-all hover:brightness-150 hover:bg-gray-800"
                  src={github_icon}
                  width={40}
                  height={40}
                />
              </a>
            }
            aria-label={`Accordion ${id}`}
            title={name}
            classNames={{
              indicator: "text-3xl text-white p-0 ",
              heading: "h-20",
              base: "m-0 p-0  ",
            }}
          >
            {description}
          </AccordionItem>
        </Accordion>
      </CardBody>
      <Skills logos={skills} />
    </Card>
  );
}

function Skills({ logos }) {
  return (
    <div className="w-full flex items-center gap-2 sm:gap-2.5 flex-wrap absolute z-30 bg-white/35 rounded-sm backdrop-blur-sm px-1.5 py-1">
      {logos?.length ? (
        logos.map((logo, index) => (
          <div
            key={index}
            className="w-[30px] h-[30px] xs:w-[40px] xs:h-[40px]"
          >
            <Image
              src={logo.src}
              alt="skill_logo"
              width={40}
              height={40}
              className="w-full h-full object-contain"
            />
          </div>
        ))
      ) : (
        <h1 className="text-white bg-red-500">NO TIENE</h1>
      )}
    </div>
  );
}
