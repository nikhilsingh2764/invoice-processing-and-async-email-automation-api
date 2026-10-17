import mongoose from 'mongoose';
import logger from '../utils/logger.js';

const connectDB = async () => {
    try {

        const connection = await mongoose.connect(process.env.MONGODB_URI);  //connect app to mongoose server
        logger.info(`MongoDB connected Successfully: ${connection.connection.host}`);

    } catch (error) {

        logger.error(`MongoDB connected Failed: ${error.message}`)
        throw new Error("Database connection failed");   //Creates and sends a new error. when JS sees throw it stop current fun execution and look for catch block to handle error

    }
}


export default connectDB;













