import js from "@eslint/js";
import prettierConfig from "eslint-config-prettier";
import prettierPlugin from "eslint-plugin-prettier";

export default [
    js.configs.recommended,
    {
        files: ["**/*.js"],
        plugins: {
            prettier: prettierPlugin
        },
        rules: {
            ...prettierConfig.rules,
            "prettier/prettier": "error",
            "no-unused-vars": ["warn", { "argsIgnorePattern": "^_" }],
            "no-console": "off"
        },
        languageOptions: {
            ecmaVersion: "latest",
            sourceType: "module",
            globals: {
                process: "readonly",
                console: "readonly",
                __dirname: "readonly"
            }
        }
    }
];