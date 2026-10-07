import Business from "../../model/invoice/Business.model.js";

class BusinessRepository {


    //create Business profile

    async create(userdata) {
        return await Business.create(userdata);
    }



    //find Business profile using userId  and email

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
        return await Business.findOneAndUpdate(
            { userId },
            data,
            {
                new: true,
                runValidators: true,
            }
        );
    }




    // check Business profile exist or not

    async existsByUserId(userId) {
        return await Business.exists({ userId });
    }


    async incrementInvoiceNumber(userId, session = null) {
        return await Business.findOneAndUpdate(
            { userId },
            { $inc: { invoiceStartNumber: 1 } },
            {
                new: true,
                runValidators: true,
                session
            }
        );
    }


};


export default new BusinessRepository();