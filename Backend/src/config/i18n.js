import i18n from "i18next";
import Backend from "i18next-fs-backend";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

i18n
    .use(Backend)
    .init({
        fallbackLng: "en",

        backend: {
            loadPath: path.join(
                __dirname,
                "../locales/{{lng}}/translation.json"
            )
        }
    });

export default i18n;