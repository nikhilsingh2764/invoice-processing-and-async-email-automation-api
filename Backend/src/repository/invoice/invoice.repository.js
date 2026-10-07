import Invoice from "../../model/invoice/invoice.model.js";

class InvoiceRepository {

    async create(userData, session = null) {
        const [invoice] = await Invoice.create([userData], { session });
        return invoice;

    }


    async findById(userId, invoiceId) {
        return await Invoice.findOne({ _id: invoiceId, userId });
    }

    async existsById(userId, invoiceId) {
        return await Invoice.exists({ _id: invoiceId, userId });
    }

    async updateById(userId, invoiceId, updatedData) {
        return await Invoice.findOneAndUpdate(
            {
                _id: invoiceId,
                userId
            },
            updatedData,
            {
                new: true,
                runValidators: true
            }
        );
    }

    async deleteById(userId, invoiceId) {
        return await Invoice.findOneAndDelete({ _id: invoiceId, userId, });
    }




}

export default new InvoiceRepository();