import { InlineWidget } from "react-calendly";
import SendEmail from "./SendEmail";
import Adress from "./Adress";

export default function Contact() {
  return (
    <section id="contact" className=" min-h-screen pb-[4rem]">
      <div className="w-[90%] mx-auto gap-8 grid grid-cols-1 lg:grid-cols-2 text-lg justify-center items-center">
        <div className="rounded-lg bg-[#263345] flex flex-col justify-between gap-2 py-4 h-full">
          <Adress />
          <SendEmail />
        </div>
        <div className="">
          <InlineWidget
            styles={{
              height: "610px",
              border: "5px solid #263345",
              borderRadius: "10px",
              scrollbarWidth: "thin",
              scrollbarColor: "#4d4d4d #2c2c2c",
              maxWidth: "600px",
              margin: "auto",
            }}
            pageSettings={{
              backgroundColor: "#263345",
              primaryColor: "#ffffff",
              textColor: "#ce70f3",
              hideGdprBanner: false,
              hideEventTypeDetails: true,
              hideLandingPageDetails: true,
            }}
            url="https://calendly.com/tomas-perez-developer/30min"
          />
        </div>
      </div>
    </section>
  );
}
