import swaggerJSDoc from "swagger-jsdoc";

const options = {
    definition: {
        openapi: "3.0.0",

        info: {
            title: "Invoice API",
            version: "1.0.0",
            description:
                "Production-oriented API documentation for the Invoice Management API"
        },

        servers: [
            {
                url: "https://special-rotary-phone-5g49xvj57j49344gq-8000.app.github.dev/api/v1"
            }
        ],

        components: {

            securitySchemes: {

                accessTokenCookie: {
                    type: "apiKey",
                    in: "cookie",
                    name: "accessToken",
                    description: "JWT access token stored in an HTTP cookie."
                },

                refreshTokenCookie: {
                    type: "apiKey",
                    in: "cookie",
                    name: "refreshToken",
                    description: "JWT refresh token stored in an HTTP cookie."
                }


            }
        }
    },


    apis: [
        "./src/route/**/*.routes.js"
    ]
};

const swaggerSpec = swaggerJSDoc(options);

export default swaggerSpec;