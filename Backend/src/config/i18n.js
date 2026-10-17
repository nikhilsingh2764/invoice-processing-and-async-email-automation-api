import i18next from "i18next";
import Backend from "i18next-fs-backend";
import middleware from "i18next-http-middleware";
import path from "path";

i18next
    .use(Backend)
    .use(middleware.LanguageDetector)
    .init({
        backend: {
            // Guarantees reliable pathing from application root
            loadPath: path.join(process.cwd(), "locales/{{lng}}/translation.json"),
        },
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