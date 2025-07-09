import admin from 'firebase-admin';

const bucket = admin.storage().bucket();

/**
 * Upload a file buffer to Firebase Storage and return the public URL.
 * @param buffer - File contents.
 * @param destinationPath - Destination path inside the bucket.
 * @returns Public URL of the uploaded file.
 */
export async function uploadFile(buffer: Buffer, destinationPath: string): Promise<string> {
  const file = bucket.file(destinationPath);
  await file.save(buffer);
  await file.makePublic();
  return file.publicUrl();
}
