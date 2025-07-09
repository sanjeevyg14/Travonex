const store: Record<string, { code: string; expiresAt: number }> = {};

function generateCode() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export async function sendOtp(identifier: string): Promise<string> {
  const code = generateCode();
  store[identifier] = { code, expiresAt: Date.now() + 5 * 60 * 1000 };
  // In real implementation, integrate with Twilio or Firebase here
  return code;
}

export async function resendOtp(identifier: string): Promise<string> {
  return sendOtp(identifier);
}

export async function validateOtp(identifier: string, code: string): Promise<boolean> {
  const entry = store[identifier];
  if (entry && entry.code === code && entry.expiresAt > Date.now()) {
    delete store[identifier];
    return true;
  }
  return false;
}

export function _getOtp(identifier: string): string | undefined {
  return store[identifier]?.code;
}
