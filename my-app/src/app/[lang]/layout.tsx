export default function LangLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // ¡Sin etiquetas html/body aquí!
  return <>{children}</>;
}

// import type { Metadata } from "next";
// import { SpeedInsights } from "@vercel/speed-insights/next";
// import { Provider } from "../providers";
// import { Poppins } from "next/font/google";
// import { Toaster } from "sonner";
// import { i18n } from "../i18n-config";
// import ".././globals.css";

// const poppins = Poppins({ weight: "500", subsets: ["latin"] });

// export const metadata: Metadata = {
//   title: "Tomas Perez Portfolio",
//   description: "My web developer portfolio, make some noise!",
// };

// export async function generateStaticParams() {
//   return i18n.locales.map((locale) => ({ lang: locale }));
// }

// export default function RootLayout({
//   children,
//   params,
// }: {
//   children: React.ReactNode;
//   params: { lang: string };
// }) {
//   return (
//     <html lang={params.lang} dir={params.lang === "ar" ? "rtl" : "ltr"}>
//       {" "}
//       {/* Agregado soporte para RTL */}
//       <body className={`${poppins.className}`}>
//         <Provider>
//           {children}
//           <Toaster
//             duration={3000}
//             style={{ backgroundColor: "#D9D9D9" }}
//             richColors={true}
//             gap={2}
//           />
//           <SpeedInsights />
//         </Provider>
//       </body>
//     </html>
//   );
// }
