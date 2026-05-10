import Link from "next/link";
import { Switch } from "@heroui/react";
import { RiTranslateAi2 } from "@remixicon/react";

export default function LangSwitcher({ lang }: { lang: string }) {
  return (
    <div>
      <Link href={lang === "es" ? "/en" : "/es"}>
        <Switch
          defaultSelected={lang === "en" ? true : false}
          color="secondary"
          startContent={<span className="text-xs">EN</span>}
          endContent={<span className="text-xs">ES</span>}
          size="lg"
        >
          <RiTranslateAi2 className="ml-0.5" />
        </Switch>
      </Link>
    </div>
  );
}
