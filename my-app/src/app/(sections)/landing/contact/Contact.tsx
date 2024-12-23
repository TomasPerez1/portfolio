import { InlineWidget } from "react-calendly";
import SendEmail from "./SendEmail";
import Adress from "./Adress";

export default function Contact() {
  return (
    <section id="contact" className=" min-h-screen pb-[6rem]">
      <div className="w-[90%]  mx-auto gap-8 grid grid-cols-2 text-lg ">
        <div className="rounded-lg bg-[#263345] flex flex-col pb-0.5">
          <Adress />
          <SendEmail />
        </div>

        <InlineWidget
          styles={{
            height: "610px",
            border: "5px solid #263345",
            borderRadius: "10px",
            scrollbarWidth: "thin",
            scrollbarColor: "#4d4d4d #2c2c2c",
          }}
          pageSettings={{
            backgroundColor: "#263345",
            primaryColor: "#ffffff",
            textColor: "#5b0f96",
            hideGdprBanner: false,
            hideEventTypeDetails: true,
            hideLandingPageDetails: true,
          }}
          url="https://calendly.com/tomas-perez-developer/30min"
        />
      </div>
    </section>
  );
}
