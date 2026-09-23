import cloudinary from "../config/cloudinary.js";
import ApiError from "../utils/ApiError.js";

// Real file signatures ("magic bytes") for the three types we accept.
// This defeats the "rename a .exe to .pdf" trick, since renaming doesn't change the actual bytes.
const SIGNATURES = [
  { mime: "application/pdf", bytes: [0x25, 0x50, 0x44, 0x46] }, // %PDF
  { mime: "image/png", bytes: [0x89, 0x50, 0x4e, 0x47] },
  { mime: "image/jpeg", bytes: [0xff, 0xd8, 0xff] },
];

export const verifyFileSignature = (buffer, claimedMime) => {
  const match = SIGNATURES.find((sig) => sig.mime === claimedMime);
  if (!match) return false;
  return match.bytes.every((byte, i) => buffer[i] === byte);
};

// Uploads a buffer to Cloudinary using a signed, server-side call.
// resource_type "raw" is used for PDFs so Cloudinary doesn't try to treat them as images.
export const uploadBufferToCloudinary = (buffer, { folder, mimeType }) =>
  new Promise((resolve, reject) => {
    const resourceType = mimeType === "application/pdf" ? "raw" : "image";
    const stream = cloudinary.uploader.upload_stream(
      { folder, resource_type: resourceType, type: "authenticated" }, // "authenticated" = not publicly guessable/listable
      (error, result) => (error ? reject(error) : resolve(result))
    );
    stream.end(buffer);
  });

export const deleteFromCloudinary = async (publicId, resourceType) => {
  try {
    await cloudinary.uploader.destroy(publicId, { resource_type: resourceType, type: "authenticated" });
  } catch (error) {
    console.error("Cloudinary delete failed:", error.message); // cleanup best-effort only
  }
};

export const assertValidUpload = (file) => {
  if (!verifyFileSignature(file.buffer, file.mimetype)) {
    throw ApiError.badRequest("The file's content does not match its claimed type");
  }
};