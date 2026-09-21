import { validationResult } from "express-validator";
import ApiError from "../utils/ApiError.js";
import translate from "../utils/translate.js";


const validate = (req, res, next) => {

    const errors = validationResult(req);


    if (!errors.isEmpty()) {
        throw new ApiError(400, translate("VALIDATION.INVALID_DATA", req.language), errors.array());
    }


    next();
};


export default validate;