import type { Metadata } from "next";
import { Provider } from "./providers";
import { Poppins } from "next/font/google";
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
      <body className={poppins.className}>
        <Provider>{children}</Provider>
      </body>
    </html>
  );
}
