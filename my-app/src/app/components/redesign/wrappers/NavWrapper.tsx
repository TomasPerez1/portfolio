"use client";

import { useTheme } from "../../../theme/useTheme";
import Nav from "../Nav";
import LangSwitch from "../LangSwitch";

export interface NavWrapperProps {
  lang: string;
}

export default function NavWrapper({ lang }: NavWrapperProps) {
  const { theme, toggleTheme } = useTheme();
  return (
    <Nav
      theme={theme}
      onToggleTheme={toggleTheme}
      langSwitch={<LangSwitch lang={lang} />}
    />
  );
}
