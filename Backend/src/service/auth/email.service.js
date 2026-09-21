import ApiError from "../../utils/ApiError.js";
import logger from "../../utils/logger.js";
import translate from "../../utils/translate.js";


const sendEmail = async ({
    to,
    subject,
    html,
    attachments = [],
    language = "en"
}) => {


 console.log("🔥 sendEmail CALLED");
    console.log("To:", to);
    console.log("Brevo key exists:", !!process.env.BREVO_API_KEY);


    try {

        const emailData = {
            sender: {
                name: "Invoice App",
                email: process.env.EMAIL_USER
            },

            to: [
                {
                    email: to
                }
            ],

            subject,

            htmlContent: html
        };


        // Add attachment only when provided
        if (attachments.length > 0) {
            emailData.attachment = attachments;
        }


        const response = await fetch(
            "https://api.brevo.com/v3/smtp/email",
            {
                method: "POST",

                headers: {
                    "accept": "application/json",
                    "content-type": "application/json",
                    "api-key": process.env.BREVO_API_KEY
                },

                body: JSON.stringify(emailData)
            }
        );


        if (!response.ok) {

            const error = await response.text();

            logger.error(
                `Email sending failed: ${to} - ${error}`
            );

            throw new ApiError(
                500,
                translate(
                    "EMAIL.EMAIL_FAILED",
                    language
                )
            );
        }


        logger.info(
            `Email sent successfully: ${to}`
        );

    } catch (error) {

        // Avoid duplicate logging for ApiError
        if (error instanceof ApiError) {
            throw error;
        }

        logger.error(
            `Email service error: ${error.message}`
        );

        throw new ApiError(
            500,
            translate(
                "EMAIL.EMAIL_FAILED",
                language
            )
        );
    }
};


export default sendEmail;