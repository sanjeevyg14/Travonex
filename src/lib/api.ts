const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000';

export async function fetchData<T>(endpoint: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${BACKEND_URL}${endpoint}`, init);
  if (!res.ok) {
    throw new Error(`Failed to fetch ${endpoint}`);
  }
  return res.json() as Promise<T>;
}
