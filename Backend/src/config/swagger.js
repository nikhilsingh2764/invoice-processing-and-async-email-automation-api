import swaggerJSDoc from "swagger-jsdoc";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const options = {
    definition: {
        openapi: "3.0.0",

        info: {
            title: "Invoice API",
            version: "1.0.0",
            description: "Production-oriented API documentation for the Invoice Management API",
        },

        servers: [
            {
                // Relative URL: Swagger UI calls the same host that serves the docs.
                url: "/api/v1",
            },
        ],

        components: {
            securitySchemes: {
                accessTokenCookie: {
                    type: "apiKey",
                    in: "cookie",
                    name: "accessToken",
                    description: "JWT access token stored in an HTTP cookie.",
                },

                refreshTokenCookie: {
                    type: "apiKey",
                    in: "cookie",
                    name: "refreshToken",
                    description: "JWT refresh token stored in an HTTP cookie.",
                },
            },
        },
    },

    apis: [
        path.join(__dirname, "../route/**/*.js"),
        path.join(__dirname, "../controller/**/*.js")
    ],
    
};

const swaggerSpec = swaggerJSDoc(options);

export default swaggerSpec;
