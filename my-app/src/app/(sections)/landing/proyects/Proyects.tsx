import ProyectCard from "./ProyectCard";

export default function Proyects() {
  type Proyect = {
    id: number;
    name: string;
    description: string;
    github: string;
    imgs: string[];
  };
  const proyects: Proyect[] = [
    {
      id: 1,
      name: "My fotolibro web",
      description:
        "Desarrollé una aplicación para un cliente especializado en la creación de libros de fotos para eventos. Laaplicación permite al administrador generar enlaces personalizados para los usuarios, quienes pueden cargar sus fotos desde la web, combinarlas con las de otros usuarios, y seleccionar el orden de impresión para la creación del libro. El administrador podra manejar sus clientes, el estado de los links y descargar las fotos comprimidas",
      github: "https://github.com/ramirofazio/my-fotolibro",
      imgs: [
        "https://nextui.org/images/hero-card-complete.jpeg",
        "https://nextui.org/images/card-example-2.jpeg",
        "https://nextui.org/images/card-example-6.jpeg",
        "https://nextui.org/images/hero-card-complete.jpeg",
      ],
    },
    {
      id: 2,
      name: "My fotolibro web",
      description:
        "Desarrollé una aplicación para un cliente especializado en la creación de libros de fotos para eventos. Laaplicación permite al administrador generar enlaces personalizados para los usuarios, quienes pueden cargar sus fotos desde la web, combinarlas con las de otros usuarios, y seleccionar el orden de impresión para la creación del libro. El administrador podra manejar sus clientes, el estado de los links y descargar las fotos comprimidas",
      github: "https://github.com/ramirofazio/my-fotolibro",
      imgs: [
        "https://nextui.org/images/hero-card-complete.jpeg",
        "https://nextui.org/images/hero-card-complete.jpeg",
        "https://nextui.org/images/hero-card-complete.jpeg",
      ],
    },
    {
      id: 3,
      name: "My fotolibro web",
      description:
        "Desarrollé una aplicación para un cliente especializado en la creación de libros de fotos para eventos. Laaplicación permite al administrador generar enlaces personalizados para los usuarios, quienes pueden cargar sus fotos desde la web, combinarlas con las de otros usuarios, y seleccionar el orden de impresión para la creación del libro. El administrador podra manejar sus clientes, el estado de los links y descargar las fotos comprimidas",
      github: "https://github.com/ramirofazio/my-fotolibro",
      imgs: [
        "https://nextui.org/images/hero-card-complete.jpeg",
        "https://nextui.org/images/hero-card-complete.jpeg",
        "https://nextui.org/images/hero-card-complete.jpeg",
      ],
    },
    {
      id: 4,
      name: "My fotolibro web",
      description:
        "Desarrollé una aplicación para un cliente especializado en la creación de libros de fotos para eventos. Laaplicación permite al administrador generar enlaces personalizados para los usuarios, quienes pueden cargar sus fotos desde la web, combinarlas con las de otros usuarios, y seleccionar el orden de impresión para la creación del libro. El administrador podra manejar sus clientes, el estado de los links y descargar las fotos comprimidas",
      github: "https://github.com/ramirofazio/my-fotolibro",
      imgs: [
        "https://nextui.org/images/hero-card-complete.jpeg",
        "https://nextui.org/images/hero-card-complete.jpeg",
        "https://nextui.org/images/hero-card-complete.jpeg",
      ],
    },
  ];
  return (
    <section id="proyects" className="min-h-screen  ">
      <div className="w-[90%] mx-auto gap-8 grid grid-cols-2 ">
        {proyects.reverse().map((proyect, i) => (
          <ProyectCard key={proyect.id} proyect={proyect} />
        ))}
      </div>
    </section>
  );
}
