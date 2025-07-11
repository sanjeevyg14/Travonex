import { readFile, unlink, mkdir } from 'fs/promises';
import path from 'path';
import { uploadFile as uploadToStorage } from './storage';

export async function uploadFile(file: Express.Multer.File): Promise<string> {
  // Read uploaded file from the tmp folder
  const buffer = await readFile(file.path);
  const ext = path.extname(file.originalname);
  // Unique destination path inside Firebase Storage
  const dest = `uploads/${Date.now()}-${Math.random().toString(36).slice(2)}${ext}`;
  const url = await uploadToStorage(buffer, dest);
  // Cleanup the temporary file
  await unlink(file.path).catch(() => {});
  return url;
}
