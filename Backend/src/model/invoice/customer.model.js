import mongoose from "mongoose";
import addressSchema from "./address.model.js";



const CustomerSchema = new mongoose.Schema({

    userId: {
        type:mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
        index: true
    },


    customerName: {
        type: String,
        required: true,
        minlength: 3,
        maxlength: 100,
        trim: true
    },


    email: {
        type: String,
        required: true,
        lowercase: true,
        trim: true,
        match: /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    },

    phone: {
        type: String,
        required: true,
        trim: true,
        match: /^[0-9]{10}$/
    },


    companyName: {
        type: String,
        trim: true,
        minlength: 3,
        maxlength: 100

    },

    gstNumber: {
        type: String,
        trim: true,
        match: /^[0-9A-Za-z]{15}$/
    },

    customerType: {
        type: String,
        trim: true,
        required: true,
        enum: ["Individual ", "Business"],
        default: "Individual"
    },

    notes: {
        type: String,
        trim: true,
        maxlength: 500
    },

    billingAddress: {

        type: addressSchema,
        required: true

    },


    shippingAddress: {

        type: addressSchema,

    }


}, { timestamps: true })

const Customer = mongoose.model("Customer", CustomerSchema)


export default Customer;
















