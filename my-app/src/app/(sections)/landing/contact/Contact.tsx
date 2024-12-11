import { InlineWidget } from "react-calendly";

export default function Contact() {
  return (
    <section id="contact" className="min-h-screen pb-[6rem]">
      <div className="w-[90%] mx-auto gap-8 grid grid-cols-2 ">
        <h1>SOY EL CONTACTT</h1>
        <InlineWidget url="https://calendly.com/tomas-perez-developer/30min" />
      </div>
    </section>
  );
}
