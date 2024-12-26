import { RiMapPinFill, RiMailFill, RiWhatsappLine } from "@remixicon/react";
import { copyToClipboard } from "../../../lib/utils";
import { Tooltip } from "@nextui-org/react";
import { RiFileCopyLine } from "@remixicon/react";

export default function Adress() {
  return (
    <article className="w-[95%]  mx-auto flex flex-col justify-center gap-1 text-sm xs:text-base sm:text-lg lg:text-base">
      <Tooltip
        content={<p className="flex items-center gap-1">Go to maps</p>}
        className="text-red-400 bg-red-900 "
        placement="right-start"
      >
        <a
          target="_blank"
          href="https://maps.app.goo.gl/5TfGqDK88sD5bhjt8"
          className="flex items-center gap-2 w-fit border-gray-500 border-b-[1px] p-1 pb-1.5"
        >
          <RiMapPinFill className="w-[30px] h-[30px] xs:w-10 xs:h-10 rounded-full border-[1.5px] p-1" />
          <p>Bariloche, Argentina.</p>
        </a>
      </Tooltip>
      <Tooltip
        content={
          <p className="flex items-center gap-1">
            <RiFileCopyLine /> Copiar
          </p>
        }
        className="text-blue-400 bg-blue-900"
        placement="right-start"
      >
        <div
          onClick={() =>
            copyToClipboard(
              "tomas.perez.developer@gmail.com",
              "Se copio el email",
            )
          }
          className="flex  items-center gap-2 w-fit border-gray-500 border-b-[1px] p-1 pb-1.5 hover:cursor-pointer"
        >
          <RiMailFill className="w-[30px] h-[30px] xs:w-10 xs:h-10 rounded-full border-[1.5px] p-1" />
          <p className="">tomas.perez.developer@gmail.com</p>
        </div>
      </Tooltip>
      <Tooltip
        content="Go to whatsapp"
        className="text-green-400 bg-green-900"
        placement="right-start"
      >
        <a
          target="_blank"
          href="https://api.whatsapp.com/send?phone=542944140001&text=Hola%20Tomas!%20me%20pesento%20soy%20__%20%2C%20un%20gusto%20ponerme%20en%20contacto%20contigo."
          className="flex items-center gap-2 w-fit border-gray-500 border-b-[1px] p-1 pb-1.5"
        >
          <RiWhatsappLine className="w-[30px] h-[30px] xs:w-10 xs:h-10 rounded-full border-[1.5px] p-1" />
          <p>+54 2944140001</p>
        </a>
      </Tooltip>
    </article>
  );
}
