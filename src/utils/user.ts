export const saveUserRole = async (
  idToken: string,
  info: Record<string, any>
) => {
  const res = await fetch('/api/auth/signup', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ idToken, accountType: 'USER', terms: true, ...info })
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error((data as any).message || 'Failed to save user');
  }
  return data;
};
