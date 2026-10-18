import Customer from "../../model/invoice/customer.model.js";

class CustomerRepository {
    // Create Customer
    async create(customerData) {
        return await Customer.create(customerData);
    }

    // Get All Customers
    //async findAll(userId) {
    //     return await Customer.find({ userId });
    // }

    // Get All Customers (with support for userId, search, filtering, skip, limit)
    async findAll(query = {}, skip = 0, limit = 10) {
        return await Customer.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit);
    }

    // Count documents matching the query (for pagination metadata)
    async countDocuments(query = {}) {
        return await Customer.countDocuments(query);
    }

    // Get Customer By ID + userId
    async findByIdAndUserId(customerId, userId) {
        return await Customer.findOne({ _id: customerId, userId });
    }

    // Get Customer By Email
    async findByEmail(email) {
        return await Customer.findOne({ email });
    }

    // Check Customer Exists
    async existsById(customerId) {
        return await Customer.exists({ _id: customerId });
    }

    // Update Customer
    async updateByIdAndUserId(customerId, userId, updatedData) {
        return await Customer.findOneAndUpdate(
            {
                _id: customerId,
                userId,
            },
            updatedData,
            {
                new: true,
                runValidators: true,
            }
        );
    }

    // Delete Customer
    async deleteByIdAndUserId(customerId, userId) {
        return await Customer.findOneAndDelete({
            _id: customerId,
            userId,
        });
    }
}

export default new CustomerRepository();
