"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

export function LangSetter() {
  const pathname = usePathname();

  useEffect(() => {
    // Extract locale from pathname
    const locale = pathname.startsWith("/en") ? "en" : "id";

    // Set the lang attribute on the html element
    document.documentElement.lang = locale;
  }, [pathname]);

  return null;
}
