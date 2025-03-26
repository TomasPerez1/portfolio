import { NextRequest, NextResponse } from "next/server";
import { i18n } from "./i18n-config";

function getLocale(request: NextRequest): any {
  const cookieLocale = request.cookies.get("NEXT_LOCALE")?.value;
  // @ts-ignore - Ignorar error de tipo en el return
  if (cookieLocale && i18n.locales.includes(cookieLocale)) {
    return cookieLocale;
  }

  // 2. Análisis mejorado del header Accept-Language
  const acceptLanguage = request.headers.get("accept-language");
  if (acceptLanguage) {
    const languages = acceptLanguage
      .split(",")
      .map((lang) => {
        const [code, q = "1"] = lang.trim().split(";q=");
        return { code: code.split("-")[0], q: parseFloat(q) };
      })
      .sort((a, b) => b.q - a.q);

    for (const { code } of languages) {
      // @ts-ignore - Ignorar error de tipo en el return
      if (i18n.locales.includes(code)) {
        return code;
      }
    }
  }

  // 3. Default seguro
  return i18n.defaultLocale;
}

export function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  const searchParams = request.nextUrl.searchParams.toString();

  // 1. Ignorar rutas estáticas, APIs y archivos
  if (
    pathname.startsWith("/_next/") ||
    pathname.startsWith("/api/") ||
    pathname.includes(".") ||
    pathname.startsWith("/favicon.ico")
  ) {
    return NextResponse.next();
  }

  // 2. Verificar si ya tiene locale
  const pathHasLocale = i18n.locales.some(
    (locale) => pathname === `/${locale}` || pathname.startsWith(`/${locale}/`),
  );

  if (pathHasLocale) {
    return NextResponse.next();
  }

  // 3. Obtener mejor locale match
  const locale = getLocale(request);

  // 4. Manejo especial para la ruta raíz
  if (pathname === "/") {
    const url = new URL(`/${locale}`, request.url);
    url.search = searchParams;
    return NextResponse.redirect(url);
  }

  // 5. Para otras rutas sin locale
  const url = new URL(`/${locale}${pathname}`, request.url);
  url.search = searchParams;
  return NextResponse.rewrite(url);
}

export const config = {
  matcher: [
    "/",
    "/((?!api|_next/static|_next/image|favicon.ico|images|icons).*)",
  ],
};
