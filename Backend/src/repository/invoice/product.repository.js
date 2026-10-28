import Product from "../../model/invoice/product.model.js";

class ProductRepository {
    // Create Product
    async create(productData, session = null) {
        const [product] = await Product.create([productData], { session });
        return product;
    }

    // Get All Products (with support for query filters, skip, limit)
    async findAll(query = {}, skip = 0, limit = 10, session = null) {
        return await Product.find(query, null, { session })
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);
    }

    // Count documents matching the query (for pagination metadata)
    async countDocuments(query = {}, session = null) {
        return await Product.countDocuments(query).session(session);
    }

    // Get Product By ID
    async findByIdAndUserId(productId, userId, session = null) {
        return await Product.findOne({ _id: productId, userId }).session(session);
    }

    // Batch Get Products By IDs and User ID (Updated to support transaction session)
    async findManyByIdsAndUserId(productIds, userId, session = null) {
        return await Product.find({
            _id: { $in: productIds },
            userId,
        }).session(session);
    }

    // Get Product By Name
    async findByName(productName, userId, session = null) {
        return await Product.findOne({
            productName,
            userId,
        }).session(session);
    }

    // Check Product Exists
    async existsById(productId, session = null) {
        return await Product.exists({ _id: productId }).session(session);
    }

    // Update Product By ID + userId
    async updateByIdAndUserId(productId, userId, updatedData, session = null) {
        return await Product.findOneAndUpdate(
            {
                _id: productId,
                userId,
            },
            updatedData,
            {
                returnDocument: "after",
                runValidators: true,
                session,
            }
        );
    }

    // Delete Product By ID + userId
    async deleteByIdAndUserId(productId, userId, session = null) {
        return await Product.findOneAndDelete({
            _id: productId,
            userId,
        }).session(session);
    }
}

export default new ProductRepository();
