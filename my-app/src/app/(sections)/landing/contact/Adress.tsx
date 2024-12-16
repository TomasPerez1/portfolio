import { RiMapPinFill, RiMailFill, RiPhoneFill } from "@remixicon/react";

export default function Adress() {
  return (
    <article className="w-[95%] mx-auto mt-8 ">
      <div className="flex gap-2">
        <RiMapPinFill className="w-10 h-6 rounded-xl" />
        <p>Bariloche, Argentina.</p>
      </div>
      <div className="flex gap-2">
        <RiMailFill className="w-10 h-6 rounded-xl" />
        <p>tomas.perez.developer@gmail.com</p>
      </div>
      <div className="flex gap-2">
        <RiPhoneFill className="w-10 h-6 rounded-xl" />
        <p>+54 2944140001</p>
      </div>
    </article>
  );
}
