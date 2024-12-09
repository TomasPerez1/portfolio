"use client";
import Image from "next/image";
import { AnimatedTestimonials } from "./AnimatedTestimonials";

export default function AboutMe() {
  type Testimonial = {
    quote: string;
    name: string;
    designation: string;
    src: string;
  };
  const testimonials: Testimonial[] = [
    {
      quote: "Una cita inspiradora",
      name: "web",
      designation: "Desarrollador Web",
      src: "https://res.cloudinary.com/dnxa8khx9/image/upload/v1730993636/scraper/internet2.png",
    },
    {
      quote: "Otra cita inspiradora",
      name: "wpp",
      designation: "Gerente de Proyecto",
      src: "https://res.cloudinary.com/dnxa8khx9/image/upload/v1730993636/scraper/wpp.png",
    },
    {
      quote: "Una tercera cita inspiradora",
      name: "ig",
      designation: "Especialista en Redes Sociales",
      src: "https://res.cloudinary.com/dnxa8khx9/image/upload/v1730993636/scraper/instagram.png",
    },
  ];

  return (
    <section id="about-me" className="border-2 border-green-500 min-h-screen">
      <figure className="max-w-[350px]">
        <Image
          src={"/profile_box.JPG"}
          alt="profile image"
          width={150}
          height={150}
          // layout="responsive"
        />
      </figure>
      <hr />
      <AnimatedTestimonials testimonials={testimonials} />
      {/* Flyon Carroucel */}
    </section>
  );
}
