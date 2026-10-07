import logger from "../utils/logger.js";
import * as Sentry from "@sentry/node";


const errorMiddleware = (err, req, res, next) => {

   // Send error to Sentry
    Sentry.captureException(err);

   logger.error({
      message: err.message,
      method: req.method,
      url: req.originalUrl,
      statusCode: err.statusCode || 500,
      stack: err.stack
   });

   const statusCode = err.statusCode || 500;


   return res.status(statusCode).json({
      success: false,
      message: err.message || "Something went wrong",
  });


};


export default errorMiddleware;


//ApiError        = only Creates the error not send to client
//errorMiddleware = Sends the error response to client

/*
1. ApiError - only creates error obj and stores error data in it not send to client

2. TryCatch - when TryCatch catches the error

try {
    ...
} catch (error) {
    next(error);
}

next(error) means: "Express, another middleware should handle this error."

3. Express calls:  errorMiddleware(err, req, res, next)
 
Now it converts the error into an HTTP response and send in to client. 

and other imp thing is:

we call ApiError is service and service not have direct access to res
Service
   ↓
throw ApiError
   ↓
TryCatch
   ↓
next(error)
   ↓
Error Middleware
   ↓
res.status(...).json(...)



and ApiRes call in controller and controller have direct acess to res
Success Response
        ↓
Controller
        ↓
res.json()


*/

