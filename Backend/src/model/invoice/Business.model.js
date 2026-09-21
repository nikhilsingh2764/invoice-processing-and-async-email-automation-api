import mongoose from "mongoose";
import addressSchema from "./address.model.js";


const businessSchema = new mongoose.Schema({

    userId: {
        type: mongoose.Schema.Types.ObjectId, //store uer_id
        ref: "User",  //refer to user schema
        required: true,
        unique: true //only one obj allow to created 
    },

    businessName: {
        type: String,
        required: true,
        trim: true,
        minlength: 3,
        maxlength: 100,
    },

    ownerName: {
        type: String,
        required: true,
        trim: true,
        minlength: 3,
        maxlength: 100,
    },

    email: {
        type: String,
        required: true,
        trim: true,
        lowercase: true,
    },

    phone: {
        type: String,
        required: true,
        trim: true,
        match: /^[0-9]{10}$/
    },

    gstNumber: {
        type: String,
        trim: true,
        match: /^[0-9A-Za-z]{15}$/,

    },

    // Business Address
    address: {
        type: addressSchema,
        required: true
    },

    currency: {
        type: String,
        trim: true,
        required: true,
        enum: ["USD", "EUR", "GBP", "JPY", "INR", "CHF", "CAD", "AUD", "CNY", "RUB", "BRL", "ZAR", "MXN", "SGD", "SEK", "KRW", "HKD", "NZD", "TRY", "IDR", "ILS"],
        default: "INR",
    },

    signature: {
        type: String,
        trim: true
    },

    logo: {
        type: String,
        trim: true
    },

    invoicePrefix: {
        type: String,
        trim: true,
        uppercase: true,
        minlength: 2,
        maxlength: 10,
        default: "INV",
    },

    invoiceStartNumber: {
        type: Number,
        default: 1,
        min: 1,

    },

    termsAndConditions: {
        type: String,
        trim: true,
        default: "Thank you for your business."
    },


}, { timestamps: true });


const Business = mongoose.model("Business", businessSchema)

export default Business;



