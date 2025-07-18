
"use client";

import * as React from "react";
import Link from 'next/link';
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
import { startOtpVerification, verifyOtp } from "@/utils/otp";
import OtpInput from "@/components/ui/OtpInput";
import { Separator } from "@/components/ui/separator";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from 'next/navigation';

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
  const [verificationId, setVerificationId] = React.useState<string | null>(null);
  
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
      const id = await startOtpVerification(currentIdentifier);
      setVerificationId(id);
      toast({ title: "OTP Sent", description: `A verification code has been sent to ${currentIdentifier}.` });
      setStep(2);
      startResendTimer();
    } catch (err: any) {
      toast({ variant: "destructive", title: "Failed to send OTP", description: err.message });
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      let credentialToSend = password;
      if (!isEmailMode) {
        if (!verificationId) throw new Error('Please request OTP first');
        const { idToken } = await verifyOtp(verificationId, otp);
        credentialToSend = idToken;
      }
      const { redirectPath } = await login(identifier, credentialToSend, loginMode);
      toast({ title: "Login Successful", description: "Redirecting..." });
      // DEV_COMMENT: Using window.location.href for a full-page reload is the most reliable way
      // to ensure the browser has processed the new session cookie before making the next request.
      // This solves the race condition that caused the login/logout loop.
      window.location.href = redirectPath || '/';
    } catch (error: any) {
        toast({
            variant: 'destructive',
            title: 'Login Failed',
            description: error.message || 'Invalid credentials or OTP. Please try again.',
        });
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOtp = async () => {
    setIsResending(true);
    try {
      if (!identifier) throw new Error('Enter your phone number first');
      const id = await startOtpVerification(identifier);
      setVerificationId(id);
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
      <form onSubmit={step === 1 ? handleIdentifierSubmit : handleLogin}>
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-headline">Welcome Back</CardTitle>
          <CardDescription>
            {step === 1 ? `Sign in with your ${loginMode} to continue.` 
                       : isEmailMode ? `Enter your password for ${identifier}` 
                                 : `Enter the code we sent to ${identifier}`}
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4">
          {step === 1 && (
            <>
              {isEmailMode ? (
                  <div className="grid gap-2">
                    <Label htmlFor="email" className="sr-only">Email Address</Label>
                     <div className="relative">
                        <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                        <Input
                        id="email"
                        type="email"
                        placeholder="e.g., admin@travonex.com"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="pl-10"
                        />
                    </div>
                  </div>
              ) : (
                <div className="grid gap-2">
                  <Label htmlFor="phone" className="sr-only">Phone Number</Label>
                   <div className="flex items-center border rounded-md focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2">
                      <Select value={countryCode} onValueChange={setCountryCode}>
                          <SelectTrigger className="w-[100px] border-0 shadow-none focus:ring-0">
                              <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                              <SelectItem value="+91">IN +91</SelectItem>
                          </SelectContent>
                      </Select>
                      <div className="h-6 w-px bg-border" />
                       <div className="relative flex-1">
                          <Phone className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                          <Input
                            id="phone"
                            type="tel"
                            placeholder="98765 43210"
                            required
                            value={phoneNumber}
                            onChange={(e) => setPhoneNumber(e.target.value)}
                            className="border-0 shadow-none pl-10 focus-visible:ring-0"
                          />
                      </div>
                  </div>
                </div>
              )}
            </>
          )}
          {step === 2 && isEmailMode && (
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
          )}
          {step === 2 && !isEmailMode && (
            <div className="grid gap-2">
                <Label htmlFor="otp">One-Time Password (OTP)</Label>
                <OtpInput value={otp} onChange={setOtp} />
            </div>
          )}
        </CardContent>
        <div id="recaptcha-container" className="hidden" />
        <CardFooter className="flex flex-col gap-4">
          <Button className="w-full" type="submit" disabled={isLoading}>
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {step === 1 ? 'Continue' : 'Sign In'}
          </Button>
           {step === 1 && (
            <>
                <div className="flex w-full items-center gap-2">
                    <Separator className="flex-1" />
                    <span className="text-xs text-muted-foreground">OR</span>
                    <Separator className="flex-1" />
                </div>
                 <Button variant="outline" size="sm" type="button" onClick={toggleLoginMode} className="w-full">
                    {isEmailMode ? <Phone className="mr-2 h-4 w-4" /> : <Mail className="mr-2 h-4 w-4" />}
                    Sign in with {isEmailMode ? 'Phone' : 'Email'}
                </Button>
            </>
           )}
           {step === 2 && !isEmailMode && (
             <Button 
                variant="link" 
                size="sm" 
                type="button" 
                onClick={handleResendOtp} 
                disabled={countdown > 0 || isResending}
             >
                {isResending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                {countdown > 0 ? `Resend OTP in ${countdown}s` : 'Resend OTP'}
             </Button>
           )}
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
