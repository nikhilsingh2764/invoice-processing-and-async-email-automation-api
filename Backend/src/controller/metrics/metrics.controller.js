import { register } from "../../config/metrics.js";

export const getMetrics = async (req, res) => {

    res.set(
        "Content-Type",
        register.contentType
    );

    return res.end(
        await register.metrics()
    );
};