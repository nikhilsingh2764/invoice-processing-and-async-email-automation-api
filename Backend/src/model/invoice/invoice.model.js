import mongoose from "mongoose";
import addressSchema from "./address.model.js";

const invoiceItemSchema = new mongoose.Schema({

    productId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product",
        required: true
    },

    productName: {
        type: String,
        required: true,
        trim: true
    },

    description: {
        type: String,
        trim: true
    },

    category: {
        type: String,
        trim: true
    },

    unit: {
        type: String,
        trim: true
    },

    price: {
        type: Number,
        required: true,
        min: 0
    },

    quantity: {
        type: Number,
        required: true,
        min: 1
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

    lineTotal: {
        type: Number,
        required: true,
        min: 0
    }

}, { _id: false });

const invoiceSchema = new mongoose.Schema({

    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
        index: true
    },

    business: {

        businessName: {
            type: String,
            required: true,
            trim: true
        },

        ownerName: {
            type: String,
            required: true,
            trim: true
        },

        email: {
            type: String,
            required: true,
            trim: true
        },

        phone: {
            type: String,
            required: true,
            trim: true
        },

        gstNumber: {
            type: String,
            trim: true
        },

        logo: {
            type: String,
            trim: true
        },

        signature: {
            type: String,
            trim: true
        },

        currency: {
            type: String,
            required: true,
            trim: true
        },

        address: {
            type: addressSchema,
            required: true
        }

    },

    customer: {

        customerName: {
            type: String,
            required: true,
            trim: true
        },

        email: {
            type: String,
            required: true,
            trim: true
        },

        phone: {
            type: String,
            required: true,
            trim: true
        },

        companyName: {
            type: String,
            trim: true
        },

        gstNumber: {
            type: String,
            trim: true
        },

        customerType: {
            type: String,
            trim: true
        },

        notes: {
            type: String,
            trim: true
        },

        billingAddress: {
            type: addressSchema,
            required: true
        },

        shippingAddress: {
            type: addressSchema
        }

    },

    items: {
        type: [invoiceItemSchema],
        required: true,
        validate: {
            validator: (items) => items.length > 0,
            message: "Invoice must contain at least one product."
        }
    },

    invoiceNumber: {
        type: String,
        required: true,
        unique: true,
        index: true,
        trim: true
    },

    subTotal: {
        type: Number,
        required: true,
        default: 0,
        min: 0
    },

    totalTax: {
        type: Number,
        required: true,
        default: 0,
        min: 0
    },

    totalDiscount: {
        type: Number,
        required: true,
        default: 0,
        min: 0
    },

    grandTotal: {
        type: Number,
        required: true,
        default: 0,
        min: 0
    },

    invoiceDate: {
        type: Date,
        default: Date.now
    },

    dueDate: {
        type: Date,
        required: true
    },

    status: {
        type: String,
        enum: [
            "Draft",
            "Pending",
            "Paid",
            "Partially Paid",
            "Overdue",
            "Cancelled"
        ],
        default: "Pending"
    },

    paymentMethod: {
        type: String,
        enum: [
            "Cash",
            "UPI",
            "Credit Card",
            "Debit Card",
            "Bank Transfer",
            "Cheque"
        ]
    },

    notes: {
        type: String,
        trim: true,
        maxlength: 1000
    },

    termsAndConditions: {
        type: String,
        trim: true,
        maxlength: 2000
    }

}, {
    timestamps: true
});

const Invoice = mongoose.model("Invoice", invoiceSchema);

export default Invoice;