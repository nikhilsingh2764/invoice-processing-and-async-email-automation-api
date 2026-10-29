import Business from "../../model/invoice/Business.model.js";

class BusinessRepository {
    //create Business profile

    async create(userdata) {
        return await Business.create(userdata);
    }

    // find Business profile using userId and email

    async findByUserId(userId) {
        return await Business.findOne({ userId });
    }

    async findByEmail(email) {
        return await Business.findOne({ email });
    }

    //delete Business profile using userId

    async deleteByUserId(userId) {
        return await Business.findOneAndDelete({ userId });
    }

    //update Business profile using userId

    //we first use findByIdAndUpdate and get error becuase this only accept and search by _id
    //know we use findOneAndUpdate allow to search on any feilds like in this userId
    async updateByUserId(userId, data) {
        return await Business.findOneAndUpdate({ userId }, data, {
            returnDocument: "after",
            runValidators: true,
        });
    }

    // check Business profile exist or not

    async existsByUserId(userId) {
        return await Business.exists({ userId });
    }

    // Atomically increments the invoice counter and returns the UPDATED business document.
    // The stored counter is the number of the invoice being created (the frontend relies on
    // "first invoice = invoiceStartNumber + 1"), so existing invoice numbers stay valid.
    async incrementInvoiceNumber(userId, session = null) {
        return await Business.findOneAndUpdate(
            { userId },
            [
                {
                    $set: {
                        nextInvoiceNumber: {
                            $add: [
                                {
                                    $ifNull: [
                                        "$nextInvoiceNumber",
                                        { $ifNull: ["$invoiceStartNumber", 1] },
                                    ],
                                },
                                1,
                            ],
                        },
                    },
                },
            ],
            { 
                updatePipeline: true,
                returnDocument: "after", 
                session 
            }
        );
    }
}

export default new BusinessRepository();
