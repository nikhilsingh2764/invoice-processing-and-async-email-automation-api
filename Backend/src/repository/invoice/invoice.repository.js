import Invoice from "../../model/invoice/invoice.model.js";

class InvoiceRepository {
    async create(userData, session = null) {
        const [invoice] = await Invoice.create([userData], { session });
        return invoice;
    }

    async findById(userId, invoiceId, session = null) {
        return await Invoice.findOne({ _id: invoiceId, userId }, null, { session });
    }

    async existsById(userId, invoiceId, session = null) {
        return await Invoice.exists({ _id: invoiceId, userId }).session(session);
    }

    async updateById(userId, invoiceId, updatedData, session = null) {
        return await Invoice.findOneAndUpdate(
            {
                _id: invoiceId,
                userId,
            },
            updatedData,
            {
                new: true,
                runValidators: true,
                session,
            }
        );
    }

    async deleteById(userId, invoiceId, session = null) {
        return await Invoice.findOneAndDelete({ _id: invoiceId, userId }, { session });
    }

    async findInvoicesNeedingOverdueStatus(session = null) {
        return await Invoice.find({
            dueDate: { $lt: new Date() },
            status: { $nin: ['PAID', 'OVERDUE'] }
        }).session(session);
    }

    
}

export default new InvoiceRepository();
