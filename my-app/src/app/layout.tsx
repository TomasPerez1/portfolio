import type { Metadata } from "next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { Provider } from "./providers";
import { Poppins } from "next/font/google";
import { Toaster } from "sonner";

import "./globals.css";

const poppins = Poppins({ weight: "500", subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Tomas Perez Portfolio",
  description: "My web developer portfolio, make some noise!",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${poppins.className}`}>
        <Provider>{children}</Provider>
        <Toaster
          duration={3000}
          style={{ backgroundColor: "#D9D9D9" }}
          richColors={true}
          gap={2}
        />
        <SpeedInsights />
      </body>
    </html>
  );
}
