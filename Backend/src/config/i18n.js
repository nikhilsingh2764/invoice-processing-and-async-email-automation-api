import i18next from "i18next";
import Backend from "i18next-fs-backend";
import middleware from "i18next-http-middleware";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

i18next
    .use(Backend)
    .use(middleware.LanguageDetector)
    .init({
        backend: {
            // Resolved relative to this file so it works from any working directory
            // (translation files live in src/locales).
            loadPath: path.join(__dirname, "../locales/{{lng}}/translation.json"),
        },
        initAsync: false, // load the translation files synchronously so they are ready at boot
        fallbackLng: "en",
        preload: ["en", "hi"],
        supportedLngs: ["en", "hi"], // Restricts matching strictly to your target languages
        detection: {
            order: ["querystring", "header", "cookie"],
            lookupQuerystring: "lang",
            // Keep "accept-language" so standard browser/HTTP headers work out-of-the-box
            lookupHeader: "accept-language",
            caches: false,
        },
    });

export default i18next;
