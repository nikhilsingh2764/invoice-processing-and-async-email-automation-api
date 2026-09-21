import {
    createCustomerService,
    getAllCustomersService,
    getCustomerByIdService,
    updateCustomerService,
    deleteCustomerService
} from "../../service/invoice/customer.service.js";

import ApiResponse from "../../utils/ApiResponse.js";
import TryCatch from "../../middleware/TryCatch.js";
import translate from "../../utils/translate.js";



export const createCustomer = TryCatch(async (req, res) => {

    const userId = req.user._id;

    const userData = {
        ...req.body,
        userId
    };


    const customer = await createCustomerService(
        userData,
        req.language
    );


    return res.status(201).json(
        new ApiResponse(
            201,
            translate(
                "CUSTOMER.CUSTOMER_CREATED",
                req.language
            ),
            customer
        )
    );

});



export const getAllCustomers = TryCatch(async (req, res) => {

    const userId = req.user._id;

    const customers = await getAllCustomersService(
        userId,
        req.language
    );


    return res.status(200).json(
        new ApiResponse(
            200,
            translate(
                "CUSTOMER.CUSTOMERS_FETCHED",
                req.language
            ),
            customers
        )
    );

});



export const getCustomerById = TryCatch(async (req, res) => {

    const userId = req.user._id;

    const {
        id: customerId
    } = req.params;


    const customer = await getCustomerByIdService(
        customerId,
        userId,
        req.language
    );


    return res.status(200).json(
        new ApiResponse(
            200,
            translate(
                "CUSTOMER.CUSTOMERS_FETCHED",
                req.language
            ),
            customer
        )
    );

});



export const updateCustomer = TryCatch(async (req, res) => {

    const userId = req.user._id;

    const {
        id: customerId
    } = req.params;

    const updatedData = req.body;


    const updatedCustomer =
        await updateCustomerService(
            customerId,
            userId,
            updatedData,
            req.language
        );


    return res.status(200).json(
        new ApiResponse(
            200,
            translate(
                "CUSTOMER.CUSTOMER_UPDATED",
                req.language
            ),
            updatedCustomer
        )
    );

});



export const deleteCustomer = TryCatch(async (req, res) => {

    const userId = req.user._id;

    const {
        id: customerId
    } = req.params;


    await deleteCustomerService(
        customerId,
        userId,
        req.language
    );


    return res.status(200).json(
        new ApiResponse(
            200,
            translate(
                "CUSTOMER.CUSTOMER_DELETED",
                req.language
            ),
            null
        )
    );

});