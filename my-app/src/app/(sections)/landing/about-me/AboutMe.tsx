"use client";
import { ProfileCarroucel } from "./ProfileCarroucel";

export default function AboutMe() {
  type Imgs = {
    name: string;
    src: string;
  };
  const imgs: Imgs[] = [
    {
      name: "web",
      src: "https://res.cloudinary.com/dnxa8khx9/image/upload/v1730993636/scraper/internet2.png",
    },
    {
      name: "wpp",
      src: "https://res.cloudinary.com/dnxa8khx9/image/upload/v1730993636/scraper/wpp.png",
    },
    {
      name: "ig",
      src: "https://res.cloudinary.com/dnxa8khx9/image/upload/v1730993636/scraper/instagram.png",
    },
  ];

  return (
    <section id="about-me" className="border-2 border-green-500 min-h-screen">
      <ProfileCarroucel imgs={imgs} autoplay={true} />
    </section>
  );
}
