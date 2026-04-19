import { v2 as cloudinary } from "cloudinary";

/**
 * ================================
 *  CLOUDINARY CONFIGURATION
 * ================================
 * File này dùng để cấu hình Cloudinary
 * và export ra instance để sử dụng trong toàn bộ project
 */

// Kiểm tra biến môi trường
if (
  !process.env.CLOUDINARY_CLOUD_NAME ||
  !process.env.CLOUDINARY_API_KEY ||
  !process.env.CLOUDINARY_API_SECRET
) {
  console.warn("⚠️ Cloudinary env variables are missing!");
}

// Cấu hình Cloudinary từ biến môi trường (.env)
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true, // dùng https
});

/**
 * ================================
 *  HELPER FUNCTIONS
 * ================================
 */

/**
 * Upload ảnh lên Cloudinary
 * @param {string} filePath - đường dẫn file local hoặc base64
 * @param {string} folder - folder lưu trên Cloudinary
 * @returns {Promise<object>}
 */
export const uploadImage = async (filePath, folder = "uploads") => {
  try {
    const result = await cloudinary.uploader.upload(filePath, {
      folder,
    });

    return {
      url: result.secure_url,
      public_id: result.public_id,
    };
  } catch (error) {
    console.error("❌ Upload failed:", error);
    throw error;
  }
};

/**
 * Upload nhiều ảnh
 * @param {Array<string>} files
 * @param {string} folder
 */
export const uploadMultipleImages = async (files, folder = "uploads") => {
  try {
    const uploads = files.map((file) =>
      cloudinary.uploader.upload(file, { folder })
    );

    const results = await Promise.all(uploads);

    return results.map((item) => ({
      url: item.secure_url,
      public_id: item.public_id,
    }));
  } catch (error) {
    console.error("❌ Multiple upload failed:", error);
    throw error;
  }
};

/**
 * Xóa ảnh khỏi Cloudinary
 * @param {string} publicId
 */
export const deleteImage = async (publicId) => {
  try {
    const result = await cloudinary.uploader.destroy(publicId);
    return result;
  } catch (error) {
    console.error("❌ Delete failed:", error);
    throw error;
  }
};

/**
 * ================================
 *  EXPORT
 * ================================
 */

export default cloudinary;