import ProyectCard from "./ProyectCard";

export default function Proyects() {
  type Proyect = {
    name: string;
    description: string;
    github: string;
    imgs: string[];
  };
  const proyects: Proyect[] = [
    { name: "", description: "", github: "", imgs: [] },
    { name: "", description: "", github: "", imgs: [] },
    { name: "", description: "", github: "", imgs: [] },
    { name: "", description: "", github: "", imgs: [] },
  ];
  return (
    <section id="proyects" className="min-h-screen  ">
      <div className="w-[90%] mx-auto gap-8 grid grid-cols-3">
        {proyects.map((proyect, i) => (
          <ProyectCard key={i} proyect={proyect} />
        ))}
      </div>
    </section>
  );
}
