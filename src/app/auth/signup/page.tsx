"use client";

import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { startOtpVerification, verifyOtp } from "@/utils/otp";
import { saveUserRole } from "@/utils/user";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import OtpInput from "@/components/ui/OtpInput";

export default function SignupPage() {
  const { toast } = useToast();
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("USER");
  const [verificationId, setVerificationId] = useState<string | null>(null);
  const [isResending, setIsResending] = useState(false);
  const [countdown, setCountdown] = useState(0);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (countdown > 0) {
      timer = setTimeout(() => setCountdown(countdown - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [countdown]);

  const sendOtp = async () => {
    try {
      const id = await startOtpVerification(phone);
      setVerificationId(id);
      toast({ title: "OTP sent" });
      setCountdown(60);
    } catch (err: any) {
      toast({ variant: "destructive", title: "Failed to send OTP", description: err.message });
    }
  };

  const handleResendOtp = async () => {
    setIsResending(true);
    try {
      if (!phone) throw new Error('Enter your phone number first');
      const id = await startOtpVerification(phone);
      setVerificationId(id);
      toast({ title: 'OTP Resent' });
      setCountdown(60);
    } catch (err: any) {
      toast({ variant: 'destructive', title: 'Failed to resend OTP', description: err.message });
    } finally {
      setIsResending(false);
    }
  };

  const handleVerify = async () => {
    if (!verificationId) return;
    try {
      const { idToken } = await verifyOtp(verificationId, otp);
      await saveUserRole(idToken, role, { name, email });
      toast({ title: "Signup successful" });
    } catch (err: any) {
      toast({ variant: "destructive", title: "Verification failed", description: err.message });
    }
  };

  return (
    <Card className="w-full max-w-sm">
      <CardHeader>
        <CardTitle>Phone Signup</CardTitle>
      </CardHeader>
      <CardContent className="grid gap-4">
        <RadioGroup value={role} onValueChange={setRole} className="flex gap-4">
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="USER" id="role-user" />
            <Label htmlFor="role-user">User</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="ORGANIZER" id="role-organizer" />
            <Label htmlFor="role-organizer">Trip Organizer</Label>
          </div>
        </RadioGroup>
        <Input placeholder="Full Name" value={name} onChange={(e) => setName(e.target.value)} />
        <Input placeholder="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
        <Input placeholder="Phone Number" value={phone} onChange={(e) => setPhone(e.target.value)} />
        {verificationId && (
          <OtpInput value={otp} onChange={setOtp} />
        )}
        <div id="recaptcha-container"></div>
      </CardContent>
      <CardFooter className="flex flex-col gap-4">
        {verificationId ? (
          <>
            <Button className="w-full" onClick={handleVerify}>Verify &amp; Sign Up</Button>
            <Button
              variant="link"
              size="sm"
              type="button"
              onClick={handleResendOtp}
              disabled={countdown > 0 || isResending}
            >
              {isResending ? 'Resending...' : countdown > 0 ? `Resend OTP in ${countdown}s` : 'Resend OTP'}
            </Button>
          </>
        ) : (
          <Button className="w-full" onClick={sendOtp}>Send OTP</Button>
        )}
        <p className="text-center text-sm text-muted-foreground pt-4">
          Already have an account?{' '}
          <Link href="/auth/login" className="font-semibold text-primary hover:underline">Sign in</Link>
        </p>
      </CardFooter>
    </Card>
  );
}
