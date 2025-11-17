import { defineRouting } from "next-intl/routing";

export const routing = defineRouting({
  // A list of all locales that are supported
  locales: ["id", "en"],

  // Used when no locale matches
  defaultLocale: "id",

  // Set default time zone globally to avoid markup mismatches
  timeZone: "Asia/Jakarta",
});
