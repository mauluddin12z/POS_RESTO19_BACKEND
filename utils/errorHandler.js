import messages from "./messages.js";

export const handleServerError = (error, res) => {
   console.error("Internal Server Error:", error);
   res.status(messages.HTTP_STATUS.INTERNAL_SERVER_ERROR.code).json({
      code: messages.HTTP_STATUS.INTERNAL_SERVER_ERROR.code,
      message: messages.HTTP_STATUS.INTERNAL_SERVER_ERROR.message,
   });
};
