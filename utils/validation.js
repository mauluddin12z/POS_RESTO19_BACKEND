export const validateRequiredStringField = (value, fieldName) => {
   if (!value || typeof value !== "string" || value.trim().length === 0) {
      return `${fieldName} is required and must be a non-empty string.`;
   }
   return null;
};

// Validate a generic required field (number, string, etc.)
export const validateRequiredField = (value, fieldName) => {
   if (value === undefined || value === null || value === "") {
      return `${fieldName} is required.`;
   }
   return null;
};

export const validateImageUpload = (
   files,
   maxImageCount,
   maxFileSize,
   allowedTypes
) => {
   if (!files || files.length === 0) {
      return "At least one file is required.";
   }
   // Check number of files
   if (files.length > maxImageCount) {
      return `Only ${maxImageCount} ${
         maxImageCount < 2 ? "image" : "images"
      } are allowed to be uploaded.`;
   }

   // Check if multiple files are uploaded
   if (!Array.isArray(files)) {
      files = [files];
   }

   for (const file of files) {
      // Check file size
      if (file.size > maxFileSize) {
         return `File size exceeds the maximum limit of ${maxFileSize} bytes.`;
      }

      // Check file type if allowedTypes is provided
      if (allowedTypes && allowedTypes.length > 0) {
         if (!allowedTypes.includes(file.mimetype)) {
            return `File type ${
               file.mimetype
            } is not allowed. Allowed types are: ${allowedTypes.join(", ")}.`;
         }
      }
   }

   return null;
};
