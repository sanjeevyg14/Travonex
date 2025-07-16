"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Mail, Phone } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RecaptchaVerifier, signInWithPhoneNumber, ConfirmationResult } from "firebase/auth";
import { auth } from "@/firebase/client";
import { Separator } from "@/components/ui/separator";
import { Loader2 } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

export default function LoginPage() {
  const { toast } = useToast();
  const { login } = useAuth();
  const router = useRouter();
  
  const [step, setStep] = React.useState(1); // 1: Enter details, 2: Enter OTP/Password
  const [loginMode, setLoginMode] = React.useState<'phone' | 'email'>('phone');
  
  // State for inputs
  const [countryCode, setCountryCode] = React.useState('+91');
  const [phoneNumber, setPhoneNumber] = React.useState('');
  const [email, setEmail] = React.useState('');

  // Combined identifier for API calls
  const [identifier, setIdentifier] = React.useState("");

  // State for credentials
  const [password, setPassword] = React.useState("");
  const [otp, setOtp] = React.useState("");
  const [confirmation, setConfirmation] = React.useState<ConfirmationResult | null>(null);
  
  const [isLoading, setIsLoading] = React.useState(false);
  const [isResending, setIsResending] = React.useState(false);
  const [countdown, setCountdown] = React.useState(0);

  const isEmailMode = loginMode === 'email';

  React.useEffect(() => {
    let timer: NodeJS.Timeout;
    if (countdown > 0) {
      timer = setTimeout(() => setCountdown(countdown - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [countdown]);

  const startResendTimer = () => {
    setCountdown(60);
  };
  
  const handleIdentifierSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    const currentIdentifier = isEmailMode ? email : `${countryCode}${phoneNumber}`;
    setIdentifier(currentIdentifier);

    if (isEmailMode) {
      setStep(2);
      setIsLoading(false);
      return;
    }

    try {
      const verifier = new RecaptchaVerifier(auth, "recaptcha-container", { size: "invisible" });
      const result = await signInWithPhoneNumber(auth, currentIdentifier, verifier);
      setConfirmation(result);
      toast({ title: "OTP Sent", description: `A verification code has been sent to ${currentIdentifier}.` });
      setStep(2);
      startResendTimer();
    } catch (err: any) {
      toast({ variant: "destructive", title: "Failed to send OTP", description: err.message });
    } finally {
      setIsLoading(false);
    }
  };

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      let credentialToSend = password;
      if (!isEmailMode) {
        if (!confirmation) throw new Error('Please request OTP first');
        const cred = await confirmation.confirm(otp);
        credentialToSend = await cred.user.getIdToken();
      }
      const { redirectPath } = await login(identifier, credentialToSend);
      const { redirectPath } = await login(email, password);
      toast({ title: "Login Successful", description: "Redirecting..." });
      window.location.href = redirectPath || "/";
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Login Failed",
        description: error.message || "Invalid credentials. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOtp = async () => {
    setIsResending(true);
    try {
      if (!identifier) throw new Error('Enter your phone number first');
      const verifier = new RecaptchaVerifier(auth, 'recaptcha-container', { size: 'invisible' });
      const result = await signInWithPhoneNumber(auth, identifier, verifier);
      setConfirmation(result);
      toast({ title: 'OTP Resent' });
      startResendTimer();
    } catch (err: any) {
      toast({ variant: 'destructive', title: 'Failed to resend OTP', description: err.message });
    } finally {
      setIsResending(false);
    }
  };

  const toggleLoginMode = () => {
    setLoginMode(isEmailMode ? 'phone' : 'email');
  }

  return (
    <Card className="w-full max-w-sm shadow-2xl">
      <form onSubmit={handleLogin}>
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-headline">Welcome Back</CardTitle>
          <CardDescription>Sign in with your email to continue.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4">
          <div className="grid gap-2">
            <Label htmlFor="email">Email Address</Label>
            <Input
              id="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
        </CardContent>
        <div id="recaptcha-container" className="hidden" />
        <CardFooter className="flex flex-col gap-4">
          <Button className="w-full" type="submit" disabled={isLoading}>
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Sign In
          </Button>
          <p className="text-center text-sm text-muted-foreground pt-4">
            {"Don't have an account? "}
            <Link href="/auth/signup" className="font-semibold text-primary hover:underline">
              Sign up
            </Link>
          </p>
        </CardFooter>
      </form>
    </Card>
  );
}
