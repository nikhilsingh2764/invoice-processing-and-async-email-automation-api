import ApiError from "../utils/ApiError.js";
import productRepository from "../repository/invoice/product.repository.js";

const toPaise = (amount) => Math.round(Number(amount) * 100);
const toRupees = (paise) => Number((paise / 100).toFixed(2));

export const buildInvoiceItems = async (items, userId) => {

    if (!items || items.length === 0) {
        throw new ApiError(400, "Invoice must contain at least one product");
    }

    // 1. Check for duplicate product IDs in the request
    const productIds = items.map(item => item.productId);
    const uniqueProductIds = new Set(productIds);
    if (uniqueProductIds.size !== productIds.length) {
        throw new ApiError(400, "Duplicate products are not allowed in the same invoice");
    }

    // 2. Validate quantities for each item early
    for (const item of items) {
        if (!item.quantity || item.quantity <= 0) {
            throw new ApiError(400, "Quantity must be greater than 0");
        }
    }

    // 3. Batch fetch all products in a SINGLE query using $in
    const products = await productRepository.findManyByIdsAndUserId(Array.from(uniqueProductIds), userId);

    // Create a O(1) lookup map keyed by product ID string
    const productMap = new Map(products.map(p => [p._id.toString(), p]));

    const invoiceItems = [];
    let subTotalPaise = 0;
    let totalTaxPaise = 0;
    let totalDiscountPaise = 0;

    for (const item of items) {
        const product = productMap.get(item.productId.toString());

        if (!product) {
            throw new ApiError(404, `Product not found or unauthorized: ${item.productId}`);
        }

        const pricePaise = toPaise(product.price);
        const itemSubTotalPaise = Math.round(pricePaise * item.quantity);

        const discountAmountPaise = Math.round((itemSubTotalPaise * product.discount) / 100);
        const taxableAmountPaise = itemSubTotalPaise - discountAmountPaise;
        const taxAmountPaise = Math.round((taxableAmountPaise * product.taxRate) / 100);
        const lineTotalPaise = taxableAmountPaise + taxAmountPaise;

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
            lineTotal: toRupees(lineTotalPaise)
        });

        subTotalPaise += itemSubTotalPaise;
        totalDiscountPaise += discountAmountPaise;
        totalTaxPaise += taxAmountPaise;
    }

    const grandTotalPaise = subTotalPaise - totalDiscountPaise + totalTaxPaise;

    return {
        invoiceItems,
        subTotal: toRupees(subTotalPaise),
        totalTax: toRupees(totalTaxPaise),
        totalDiscount: toRupees(totalDiscountPaise),
        grandTotal: toRupees(grandTotalPaise)
    };

};