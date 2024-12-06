import Landing from "./(sections)/landing/Landing";
import NavBar from "./ui/NavBar";

export default function Home() {
  return (
    <main className="bg-violet-950 min-h-screen flex">
      <section
        id="navigation"
        className="w-[20%] h-full min-h-screen items-center fixed"
      >
        <NavBar />
      </section>
      <section className="ml-[20%] w-[80%]" id="content">
        <Landing />
      </section>
    </main>
  );
}
