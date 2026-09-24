import mongoose from "mongoose";
import { connectDB } from "../src/config/db.js";
import cloudinary from "../src/config/cloudinary.js";
import Document from "../src/models/Document.js";

const documentId = process.argv[2];

try {
  if (!documentId) throw new Error("Usage: node scripts/tamper-test.js <documentId>");

  await connectDB();
  const document = await Document.findById(documentId);
  if (!document) throw new Error("Document not found");

  const originalResourceType = document.mimeType === "application/pdf" ? "raw" : "image";
  const fakeContent = Buffer.from(`TAMPERED CONTENT — ${Date.now()}`);

  // Delete the original asset first (its resource_type may differ from what we're about to upload)
  await cloudinary.uploader.destroy(document.cloudinaryPublicId, {
    resource_type: originalResourceType,
    type: "authenticated",
  });

  // Re-upload the SAME public_id, but always as "raw" so arbitrary bytes are accepted,
  // regardless of whether the original was a PDF or an image.
  await new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        public_id: document.cloudinaryPublicId,
        resource_type: "raw",
        type: "authenticated",
        overwrite: true,
        invalidate: true,
      },
      (error, result) => (error ? reject(error) : resolve(result))
    );
    stream.end(fakeContent);
  });

  console.log(`✅ Overwrote Cloudinary asset for document ${documentId} with different content.`);
  console.log("The stored fileHash in MongoDB was NOT changed — this simulates real tampering.");
  console.log(`NOTE: the asset is now stored as resource_type "raw", regardless of its original type.`);
} catch (error) {
  console.error("❌", error.message);
} finally {
  await mongoose.disconnect();
}