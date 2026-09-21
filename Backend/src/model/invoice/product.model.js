import mongoose from "mongoose";

const productSchema = mongoose.Schema({

    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true
    },

    productName: {
        type: String,
        required: true,
        trim: true,
        minlength: 3,
        maxlength: 100
    },

    description: {
        type: String,
        required: true,
        trim: true,
        maxlength: 500
    },

    category: {
        type: String,
        required: true,
    },

    unit: {
        type: String,
        required: true,
        trim: true,
        enum: ["piece", "kg", "gram", "liter", "meter", "hour", "service"],
        default: "piece"
    },

    price: {
        type: Number,
        required: true,
        min: 0,
    },

    taxRate: {
        type: Number,
        default: 0,
        min: 0,
        max: 100
    },

    discount: {
        type: Number,
        default: 0,
        min: 0,
        max: 100
    },



}, { timestamps: true })

const Product = mongoose.model("Product", productSchema)

export default Product;