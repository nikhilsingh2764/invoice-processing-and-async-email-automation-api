import mongoose from "mongoose";

const addressSchema = new mongoose.Schema({

    addressLine1: {
        type: String,
        required: true,
        trim: true
    },

    addressLine2: {
        type: String,
        trim: true
    },

    city: {
        type: String,
        required: true,
        trim: true
    },

    state: {
        type: String,
        required: true,
        trim: true,
        enum: [
            "Andhra Pradesh",
            "Arunachal Pradesh",
            "Assam",
            "Bihar",
            "Chhattisgarh",
            "Goa",
            "Gujarat",
            "Haryana",
            "Himachal Pradesh",
            "Jharkhand",
            "Karnataka",
            "Kerala",
            "Madhya Pradesh",
            "Maharashtra",
            "Manipur",
            "Meghalaya",
            "Mizoram",
            "Nagaland",
            "Odisha",
            "Punjab",
            "Rajasthan",
            "Sikkim",
            "Tamil Nadu",
            "Telangana",
            "Tripura",
            "Uttar Pradesh",
            "Uttarakhand",
            "West Bengal"
        ],
        default: "Assam"
    },

    country: {
        type: String,
        required: true,
        trim: true,
        enum: ["India"],
        default: "India"
    },

    postalCode: {
        type: String,
        required: true,
        trim: true,
        match: /^[1-9][0-9]{5}$/
    }

}, { _id: false });

export default addressSchema;