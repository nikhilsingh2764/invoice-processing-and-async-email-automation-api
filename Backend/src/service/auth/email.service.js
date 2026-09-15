import ApiError from "../../utils/ApiError.js";
import logger from "../../utils/logger.js";
import translate from "../../utils/translate.js";


// Builds a readable plain-text version from the HTML (better deliverability, helps text-only clients)
const htmlToText = (html = "") =>
    String(html)
        .replace(/<head[\s\S]*?<\/head>/gi, "")
        .replace(/<style[\s\S]*?<\/style>/gi, "")
        .replace(/<div[^>]*display:none[\s\S]*?<\/div>/gi, "")
        .replace(/<\/td>\s*<td[^>]*>/gi, "  ")
        .replace(/<br\s*\/?>/gi, "\n")
        .replace(/<\/(tr|div|p|h[1-6]|table)>/gi, "\n")
        .replace(/<a [^>]*href="([^"]+)"[^>]*>([\s\S]*?)<\/a>/gi, (_, href, label) =>
            href.startsWith("mailto:") ? label : `${label} (${href})`)
        .replace(/<[^>]+>/g, "")
        .replace(/&nbsp;/g, " ")
        .replace(/&middot;/g, "-")
        .replace(/&times;/g, "x")
        .replace(/&ndash;/g, "-")
        .replace(/&amp;/g, "&")
        .replace(/&lt;/g, "<")
        .replace(/&gt;/g, ">")
        .replace(/&quot;/g, '"')
        .replace(/[ \t]+\n/g, "\n")
        .replace(/\n[ \t]+/g, "\n")
        .replace(/[ \t]{3,}/g, "  ")
        .replace(/\n{3,}/g, "\n\n")
        .trim();

const sendEmail = async ({
    to,
    subject,
    html,
    attachments = [],
    language = "en",
    senderName = "Invoice App",
    replyTo,
    text,
    tags = []
}) => {


 console.log("🔥 sendEmail CALLED");
    console.log("To:", to);
    console.log("Brevo key exists:", !!process.env.BREVO_API_KEY);


    try {

        const emailData = {
            sender: {
                name: senderName || "Invoice App",
                email: process.env.EMAIL_USER
            },

            to: [
                {
                    email: to
                }
            ],

            subject,

            htmlContent: html,
            textContent: text || htmlToText(html)
        };

        if (tags.length > 0) {
            emailData.tags = tags;
        }


        // Replies go to the business (optional)
        if (replyTo) {
            emailData.replyTo = { email: replyTo };
        }

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
                `Email sending failed: ${to} - [Brevo ${response.status}] ${error}`
            );

            // Brevo's real reason travels with the error so the worker log shows it
            throw new ApiError(
                500,
                translate(
                    "EMAIL.EMAIL_FAILED",
                    language
                ),
                [{ provider: "brevo", status: response.status, reason: error }]
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