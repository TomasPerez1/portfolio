"use client";

import { NextUIProvider } from "@nextui-org/react";
import React, { FC, ReactNode } from "react";

export const Provider: FC<{ children: ReactNode }> = ({ children }) => {
  // @ts-ignore - Solución temporal para deploy
  return <NextUIProvider>{children}</NextUIProvider>;
};
