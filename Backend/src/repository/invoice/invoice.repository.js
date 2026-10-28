import Invoice from "../../model/invoice/invoice.model.js";
import { PAYMENT_STATUS } from "../../utils/invoice.constant.js";

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
                returnDocument: "after",
                runValidators: true,
                session,
            }
        );
    }

    async deleteById(userId, invoiceId, session = null) {
        return await Invoice.findOneAndDelete({ _id: invoiceId, userId }, { session });
    }

    // Invoices that are past their due date but still waiting for payment.
    // Paid, Cancelled, Draft and already Overdue invoices must never be touched.
    async findInvoicesNeedingOverdueStatus(session = null) {
        return await Invoice.find({
            dueDate: { $lt: new Date() },
            status: { $in: [PAYMENT_STATUS.PENDING, PAYMENT_STATUS.PARTIALLY_PAID] },
        }).session(session);
    }
}

export default new InvoiceRepository();
