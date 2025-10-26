import { messages, Language, MessageKey } from "../messages/index.js";

export function getLocalizedMessage(
  key: MessageKey,
  type: "errors" | "success" = "errors",
  lang: Language = "id"
): string {
  const messageSet = messages[lang][type];
  return messageSet[key as keyof typeof messageSet] || key;
}

export function getLanguageFromHeader(c: any): Language {
  // Try to get language from Accept-Language header
  const acceptLanguage = c.req.header("Accept-Language");
  if (acceptLanguage && acceptLanguage.startsWith("en")) {
    return "en";
  }
  // Default to Indonesian
  return "id";
}
