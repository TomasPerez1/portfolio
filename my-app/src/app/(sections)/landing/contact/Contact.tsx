import { InlineWidget } from "react-calendly";

export default function Contact() {
  return (
    <section id="contact" className="min-h-screen pb-[6rem]">
      <div className="w-[90%]  mx-auto gap-8 grid grid-cols-2 text-lg">
        <h1 className="rounded-lg">SOY EL CONTACTT</h1>
        <InlineWidget
          styles={{
            height: "610px",
            border: "5px solid green",
            borderRadius: "10px",
            scrollbarWidth: "thin",
            scrollbarColor: "#4d4d4d #2c2c2c",
          }}
          pageSettings={{
            backgroundColor: "#6A669D",
            primaryColor: "#ffffff",
            textColor: "#640D5F",
            hideGdprBanner: true,
            hideEventTypeDetails: true,
            hideLandingPageDetails: true,
          }}
          url="https://calendly.com/tomas-perez-developer/30min"
        />
      </div>
    </section>
  );
}
