import i18n from "../config/i18n.js";

const translate = (key, language = "en") => {
    return i18n.t(key, {
        lng: language
    });
};

export default translate;