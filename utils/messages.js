const messages = {
   // HTTP status codes
   HTTP_STATUS: {
      OK: { code: 200, message: "OK" },
      CREATED: { code: 201, message: "Created" },
      ACCEPTED: { code: 202, message: "Accepted" },
      BAD_REQUEST: { code: 400, message: "Bad Request" },
      UNAUTHORIZED: { code: 401, message: "Unauthorized" },
      FORBIDDEN: { code: 403, message: "Forbidden" },
      NOT_FOUND: { code: 404, message: "Not Found" },
      CONFLICT: { code: 409, message: "Conflict" },
      INTERNAL_SERVER_ERROR: { code: 500, message: "Internal Server Error" },
      NOT_IMPLEMENTED: { code: 501, message: "Not Implemented" },
      SERVICE_UNAVAILABLE: { code: 503, message: "Service Unavailable" },
   },

   // Specific error messages
   data_found: "Data found",
   no_data_found: "No data found",
   not_found: "Not found",
   x_not_found: "%{name} not found!",
   updated_successfully: "Updated successfully",
   x_updated_successfully: "%{name} updated successfully",
   created_successfully: "Created successfully",
   x_created_successfully: "%{name} created successfully",
   deleted_successfully: "Deleted successfully",
   x_deleted_successfully: "%{name} deleted successfully",
   request_submitted: "Order %{code} Code has been Submitted successfully",
   orders_not_found: "No orders yet",
   duplicate_name: "%{name} with this name already exists.",

   // Get message by code
   getMessageByCode: (code) => {
      for (const key in messages.HTTP_STATUS) {
         if (messages.HTTP_STATUS[key].code === code) {
            return messages.HTTP_STATUS[key].message;
         }
      }
      return "Unknown Status Code";
   },
};

export default messages;
