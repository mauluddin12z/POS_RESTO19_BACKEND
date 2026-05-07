import cloudinary from "./cloudinary.js";
import path from "path";
import DatauriParser from "datauri/parser.js";

// Function to extract public ID from Cloudinary image URL
const extractPublicId = (imageUrl) => {
   // Split URL by "/"
   const splitUrl = imageUrl.split("/");
   // Find the index of "upload" in the URL
   const uploadIndex = splitUrl.indexOf("upload");
   // Extract the part of URL after "upload/"
   let publicIdPart = splitUrl.slice(uploadIndex + 2).join("/");
   // Remove the file extension
   const publicId = publicIdPart.split(".").slice(0, -1).join(".");
   return publicId;
};

// Uploads an image to Cloudinary.
export const uploadImageToCloudinary = async (imageFile, folderDestination) => {
   try {
      const dataUri = new DatauriParser();
      const dataUriString = dataUri.format(
         path.extname(imageFile.name).toString(),
         imageFile.data
      ).content;

      // Upload the file to Cloudinary
      const image = await cloudinary.uploader.upload(dataUriString, {
         folder: folderDestination,
      });

      return image.secure_url;
   } catch (error) {
      throw new Error("Error uploading image to Cloudinary");
   }
};

// Deletes an image from Cloudinary.
export const deleteImageFromCloudinary = async (imageUrl) => {
   try {
      // Extract public ID from image URL
      const publicId = extractPublicId(imageUrl);
      const result = await cloudinary.uploader.destroy(publicId);
      return result;
   } catch (error) {
      throw new Error("Error deleting image from Cloudinary");
   }
};
