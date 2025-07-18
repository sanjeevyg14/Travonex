import { RecaptchaVerifier, signInWithPhoneNumber, PhoneAuthProvider, signInWithCredential } from 'firebase/auth';
import { auth } from '@/firebase/client';

let verifier: RecaptchaVerifier | null = null;

export const startOtpVerification = async (phoneNumber: string): Promise<string> => {
  // Always recreate the verifier to avoid "reCAPTCHA client element has been removed" errors
  try {
    verifier?.clear();
  } catch {
    // ignore if clear fails
  }
  verifier = new RecaptchaVerifier(auth, 'recaptcha-container', { size: 'invisible' });
  const result = await signInWithPhoneNumber(auth, phoneNumber, verifier);
  return result.verificationId;
};

export const verifyOtp = async (verificationId: string, code: string) => {
  const credential = PhoneAuthProvider.credential(verificationId, code);
  const userCred = await signInWithCredential(auth, credential);
  const idToken = await userCred.user.getIdToken();
  return { uid: userCred.user.uid, idToken };
};
