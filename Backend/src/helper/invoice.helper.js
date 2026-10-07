import ApiError from "../utils/ApiError.js";
import productRepository from "../repository/invoice/product.repository.js";

export const buildInvoiceItems = async (items, userId) => {

    if (!items || items.length === 0) {
        throw new ApiError(400, "Invoice must contain at least one product");
    }

    const invoiceItems = [];

    let subTotal = 0;
    let totalTax = 0;
    let totalDiscount = 0;

    for (const item of items) {

        const product = await productRepository.findByIdAndUserId(item.productId, userId);

        if (!product) {
            throw new ApiError(404, `Product not found: ${item.productId}`);
        }

        const itemSubTotal = product.price * item.quantity;

        const discountAmount =
            (itemSubTotal * product.discount) / 100;

        const taxableAmount =
            itemSubTotal - discountAmount;

        const taxAmount =
            (taxableAmount * product.taxRate) / 100;

        const lineTotal =
            taxableAmount + taxAmount;

        invoiceItems.push({

            productId: product._id,
            productName: product.productName,
            description: product.description,
            category: product.category,
            unit: product.unit,
            price: product.price,
            quantity: item.quantity,
            taxRate: product.taxRate,
            discount: product.discount,
            lineTotal

        });

        subTotal += itemSubTotal;
        totalDiscount += discountAmount;
        totalTax += taxAmount;
    }

    return {

        invoiceItems,
        subTotal,
        totalTax,
        totalDiscount,
        grandTotal: subTotal - totalDiscount + totalTax

    };

};