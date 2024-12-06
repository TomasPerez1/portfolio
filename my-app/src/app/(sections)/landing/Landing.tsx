import Spline from "@splinetool/react-spline";

export default function Landing() {
  return (
    <section
      id="about-me"
      className="min-h-screen w-full border-2 border-yellow-400 flex flex-col justify-between"
    >
      <article className="text-center">
        <span className="border-2">
          <h1 className="text-8xl">
            Tomas <br /> Perez
          </h1>
          <h2 className="text-2xl text-[#cda3ff]">FULL STACK DEVELOPER</h2>
        </span>
        <div className="w-[10rem] h-[10rem] text-center bg-blue-700 border-2 border-blue-700">
          <h1>Soy el trhee js</h1>
        </div>
      </article>
      <div className="">
        <Spline scene="https://prod.spline.design/kNH4bJ2gKmOkyLaU/scene.splinecode" />
      </div>
      <div className="w-fit mx-auto mb-8 animate-bounce ">
        <p className="text-5xl ">👇</p>
      </div>
    </section>
  );
}
