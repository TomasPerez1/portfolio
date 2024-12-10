import {
  Card,
  CardHeader,
  CardBody,
  Accordion,
  AccordionItem,
} from "@nextui-org/react";
import { Carousel } from "./Carousel";
import Image from "next/image";

export default function ProyectCard({ proyect }) {
  const { id, name, description, github, imgs } = proyect;

  return (
    <Card className="py-2 bg-gray-600 flex-shrink-0 max-h-fit ">
      <CardHeader className=" px-0 flex-col items-start">
        <Carousel imgs={imgs} />
      </CardHeader>
      <CardBody className="overflow-visible py-0">
        <Accordion className="py-0">
          <AccordionItem
            key={id}
            aria-label={`Accordion ${id}`}
            title={name}
            // subtitle="descripción"
            classNames={{
              indicator: "text-3xl text-white p-0 ",
            }}
          >
            {description}
          </AccordionItem>
        </Accordion>
      </CardBody>
    </Card>
  );
}
