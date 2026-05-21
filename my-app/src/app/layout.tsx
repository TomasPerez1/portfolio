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
  title: "Tomás Pérez — Full-stack Developer",
  description:
    "3+ years building enterprise platforms with Node.js, React, Next.js and TypeScript. Backend-oriented full-stack developer based in Buenos Aires, Argentina.",
  keywords: [
    "full-stack developer",
    "node.js",
    "react",
    "nextjs",
    "typescript",
    "nestjs",
    "backend",
    "argentina",
    "buenos aires",
  ],
  authors: [{ name: "Tomás Pérez" }],
  openGraph: {
    title: "Tomás Pérez — Full-stack Developer",
    description: "Portfolio · Full-stack engineer · Buenos Aires, Argentina",
    type: "website",
    locale: "en_US",
    alternateLocale: ["es_AR"],
  },
  twitter: {
    card: "summary_large_image",
    title: "Tomás Pérez — Full-stack Developer",
    description: "Portfolio · Full-stack engineer · Buenos Aires, Argentina",
  },
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const lang = (await cookies()).get("NEXT_LOCALE")?.value || "en";

  return (
    <html
      lang={lang}
      suppressHydrationWarning
      className={`${bricolage.variable} ${geist.variable} ${jetbrainsMono.variable}`}
    >
      <head>
        {/* Theme-flash prevention: must run synchronously before paint. next/script strategies would cause FOUC. */}
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var s=localStorage.getItem("theme");var d=s||(window.matchMedia("(prefers-color-scheme: dark)").matches?"dark":"light");document.documentElement.setAttribute("data-theme",d);}catch(e){document.documentElement.setAttribute("data-theme","dark");}})();`,
          }}
        />
      </head>
      <body className={poppins.className}>
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
