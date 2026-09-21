import "dotenv/config";

import app from "./app.js";
import connectDB from "./config/db.js";


import emailWorker from "./worker/email.worker.js";
import invoicePDFWorker from "./worker/invoicePDF.worker.js";
import invoiceEmailWorker from "./worker/invoiceEmail.worker.js";

import redis from "./config/redis.js";

import gracefulShutdown from "./utils/gracefulShutdown.js";

const PORT=process.env.PORT || 5000;
const startServer = async () => {

    try {

        await connectDB();

        const server = app.listen(PORT, "0.0.0.0", () => {  //method in express that starts the server 
            console.log(`server is running at port ${PORT} `);
            console.log(`http://localhost:${PORT}`);
        });

        // Graceful shutdown on deployment
        process.on("SIGINT", () => {
            gracefulShutdown({
                server,
                redis,
                workers: [
                    emailWorker,
                    invoicePDFWorker,
                    invoiceEmailWorker
                ]

            });

        });

        // Graceful shutdown on Ctrl + C 
        process.on("SIGINT", () => {
            gracefulShutdown({
                server,
                redis,
                workers: [
                    emailWorker,
                    invoicePDFWorker,
                    invoiceEmailWorker
                ]
            });

        });


    } catch (error) {

        console.error("Server failed to start:", error.message);

    }



};

startServer();










