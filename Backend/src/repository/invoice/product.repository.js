import Product from "../../model/invoice/product.model.js";

class ProductRepository {

    // Create Product
    async create(productData) {
        return await Product.create(productData);
    }

    // Get All Products (with support for query filters, skip, limit)
    async findAll(query = {}, skip = 0, limit = 10) {
        return await Product.find(query)
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);
    }

    // Count documents matching the query (for pagination metadata)
    async countDocuments(query = {}) {
        return await Product.countDocuments(query);
    }

    // Get Product By ID
    async findByIdAndUserId(productId, userId) {
        return await Product.findOne({ _id: productId, userId });
    }

    // Batch Get Products By IDs and User ID (NEW)
    async findManyByIdsAndUserId(productIds, userId) {
        return await Product.find({
            _id: { $in: productIds },
            userId
        });
    }

    // Get Product By Name
    async findByName(productName, userId) {
        return await Product.findOne({
            productName,
            userId
        });
    }

    // Check Product Exists
    async existsById(productId) {
        return await Product.exists({ _id: productId });
    }

    // Update Product By ID + userId
    async updateByIdAndUserId(productId, userId, updatedData) {
        return await Product.findOneAndUpdate(
            {
                _id: productId,
                userId
            },
            updatedData,
            {
                new: true,
                runValidators: true
            }
        );
    }

    // Delete Product By ID + userId
    async deleteByIdAndUserId(productId, userId) {
        return await Product.findOneAndDelete({
            _id: productId,
            userId
        });
    }

}

export default new ProductRepository();