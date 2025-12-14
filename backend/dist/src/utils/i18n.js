import { messages } from "../messages/index.js";
export function getLocalizedMessage(key, type = "errors", lang = "id") {
    const messageSet = messages[lang][type];
    return messageSet[key] || key;
}
export function getLanguageFromHeader(c) {
    // Try to get language from Accept-Language header
    const acceptLanguage = c.req.header("Accept-Language");
    if (acceptLanguage && acceptLanguage.startsWith("en")) {
        return "en";
    }
    // Default to Indonesian
    return "id";
}
