
import bcrypt from "bcrypt";
import generateOTP from "../../utils/generateOTP.js";

import otpTemplate from "../../templates/otp.template.js";
import resetPasswordTemplate from "../../templates/resetPassword.template.js";

import redis from "../../config/redis.js";
import logger from "../../utils/logger.js";

import { emailQueue } from "../../queues/email.queue.js";

import translate from "../../utils/translate.js";


const SALT_ROUNDS = 10;


const sendOTPService = async ({ username = null, email, password = null, type, language = "en" }) => {

    // Hash password
    let hashedPassword = null;

    // Hash password only for signup
    if (type === "EMAIL_VERIFICATION") {
        hashedPassword = await bcrypt.hash(
            password,
            SALT_ROUNDS
        );
    }


    // Generate 6-digit OTP
    const otp = generateOTP();

    // NEVER log OTP
    console.log("otp is:-",otp);

    console.log("otp service");



    // Store OTP in Redis with expiry
    const key = `otp:${type}:${email}`;

    const otpData = {
        otp,
        email,
        username,
        password: hashedPassword,
        type
    };


    await redis.set(
        key,
        JSON.stringify(otpData),
        "EX",
        300
    );


    // Prepare email
    let subject;
    let html;


    if (type === "EMAIL_VERIFICATION") {

        subject = translate(
            "AUTH.EMAIL_VERIFICATION_SUBJECT",
            language
        );

        html = otpTemplate(
            username,
            otp,
            language
        );

    } else if (type === "PASSWORD_RESET") {

        subject = translate(
            "AUTH.PASSWORD_RESET_SUBJECT",
            language
        );

        html = resetPasswordTemplate(
            otp,
            language
        );
    }


    // Add email job to BullMQ

        const job = await emailQueue.add(
            "send-email",
            {
                to: email,
                subject,
                html,
                language
            },
            {
                // Optional: Ensure job ID is unique or trackable
                removeOnComplete: true,
                removeOnFail: false
            }
        );




    logger.info(
        `OTP generated and email queued: ${type}`
    );


    return null;
};


export default sendOTPService;