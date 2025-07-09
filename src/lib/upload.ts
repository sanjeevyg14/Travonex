import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage } from './firebase';

/**
 * Uploads a file to Firebase Storage and returns the public URL.
 * The caller can optionally provide a path; otherwise a timestamped name is used.
 */
export async function uploadFile(file: File | Blob, path?: string): Promise<string> {
  const filePath = path || `uploads/${Date.now()}-${(file as File).name ?? 'file'}`;
  const fileRef = ref(storage, filePath);
  await uploadBytes(fileRef, file);
  return await getDownloadURL(fileRef);
}
