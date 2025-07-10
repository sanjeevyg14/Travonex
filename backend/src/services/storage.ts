import admin from 'firebase-admin';

let bucket: any | null = null;

function getBucket() {
  if (!bucket) {
    if (!admin.apps.length) return null;
    bucket = admin.storage().bucket();
  }
  return bucket;
}

/**
 * Upload a file buffer to Firebase Storage and return the public URL.
 * @param buffer - File contents.
 * @param destinationPath - Destination path inside the bucket.
 * @returns Public URL of the uploaded file.
 */
export async function uploadFile(buffer: Buffer, destinationPath: string): Promise<string> {
  const b = getBucket();
  if (!b) {
    console.warn('Firebase not initialized, returning placeholder URL');
    return `https://placehold.co/600x400?text=upload`;
  }
  const file = b.file(destinationPath);
  await file.save(buffer);
  await file.makePublic();
  return file.publicUrl();
}
