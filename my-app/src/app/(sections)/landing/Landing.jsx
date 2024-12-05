import { Button } from "@nextui-org/button";

export default function Landing() {
  return (
    <section className="border-2  min-h-screen">
      <article className=" border-2 border-yellow-400 text-center w-fit">
        <h1 className="text-8xl">
          Tomas <br /> Perez
        </h1>
        <h2 className="text-2xl text-[#cda3ff]">FULL STACK DEVELOPER</h2>
      </article>
      <div className="w-[10rem] h-[10rem] text-center bg-blue-700 border-2 border-blue-700">
        <h1>Soy el trhee js</h1>
      </div>
    </section>
  );
}
