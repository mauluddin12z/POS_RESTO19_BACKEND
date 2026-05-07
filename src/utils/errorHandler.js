import messages from "../utils/messages.js";

const errorHandler = (err, req, res, next) => {
   console.error("🔥 Error:", err);

   const status = err.status || 500;

   const message =
      err.message || messages.HTTP_STATUS.INTERNAL_SERVER_ERROR.message;

   res.status(status).json({
      code: status,
      message,
   });
};

export default errorHandler;
