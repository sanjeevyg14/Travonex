export const saveUserRole = async (idToken: string, role: string, info: Record<string, any>) => {
  const res = await fetch('/api/auth/signup', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ idToken, role, ...info })
  });
  if (!res.ok) throw new Error('Failed to save user');
  return res.json();
};
