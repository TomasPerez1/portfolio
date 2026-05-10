import type { Metadata } from "next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { Provider } from "./providers";
import { Poppins } from "next/font/google";
import { Toaster } from "sonner";
import { cookies } from "next/headers";
import { bricolage, geist, jetbrainsMono } from "./fonts";
import "./globals.css";

const poppins = Poppins({
  weight: "500",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Tomas Perez Portfolio",
  description: "My web developer portfolio, make some noise!",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const lang = cookies().get("NEXT_LOCALE")?.value || "en";

  return (
    <html
      lang={lang}
      suppressHydrationWarning
      className={`${bricolage.variable} ${geist.variable} ${jetbrainsMono.variable}`}
    >
      <body className={poppins.className}>
        {/* @ts-expect-error - NextUI type complexity */}
        <Provider>
          <>
            {children}
            <Toaster
              duration={3000}
              style={{ backgroundColor: "#D9D9D9" }}
              richColors
              gap={2}
            />
            <SpeedInsights />
          </>
        </Provider>
      </body>
    </html>
  );
}
