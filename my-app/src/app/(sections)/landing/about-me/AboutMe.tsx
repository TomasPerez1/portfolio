"use client";
import React from "react";
import { Suspense } from "react";
import Loader from "../../../ui/Loader";
const ProfileCarroucel = React.lazy(() => import("./ProfileCarroucel"));
import { useTranslation } from "../../../i18n/client";

export type Imgs = {
  name: string;
  src: string;
  lang?: string;
};

export default function AboutMe({ lang }: { lang: string }) {
  const { t } = useTranslation(lang, "common");

  const imgs: Imgs[] = [
    {
      name: "profile1",
      src: "/profile/cvprofile.jpg",
    },
    {
      name: "profile2",
      src: "/profile/profilebox.jpg",
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
          <ProfileCarroucel lang={lang} imgs={imgs} autoplay={false} />
        </Suspense>

        <span className="p-4  bg-gray-800 rounded-lg  w-[85%] mx-auto lg:w-[90%]">
          <p dangerouslySetInnerHTML={{ __html: t("about-me") }}></p>
        </span>
      </article>
    </section>
  );
}
