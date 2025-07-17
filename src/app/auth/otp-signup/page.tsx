"use client";

import { useState } from "react";
import { RecaptchaVerifier, signInWithPhoneNumber, ConfirmationResult } from "firebase/auth";
import { auth } from "@/firebase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";

export default function OtpSignupPage() {
  const { toast } = useToast();
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("USER");
  const [confirmation, setConfirmation] = useState<ConfirmationResult | null>(null);

  const sendOtp = async () => {
    try {
      const verifier = new RecaptchaVerifier(auth, "recaptcha-container", { size: "invisible" });
      const result = await signInWithPhoneNumber(auth, phone, verifier);
      setConfirmation(result);
      toast({ title: "OTP sent" });
    } catch (err: any) {
      toast({ variant: "destructive", title: "Failed to send OTP", description: err.message });
    }
  };

  const verifyOtp = async () => {
    if (!confirmation) return;
    try {
      const cred = await confirmation.confirm(otp);
      const idToken = await cred.user.getIdToken();
      const res = await fetch("/api/auth/otp-signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idToken, name, email, role }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Signup failed");
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
        <Input placeholder="Full Name" value={name} onChange={(e) => setName(e.target.value)} />
        <Input placeholder="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
        <Input placeholder="Phone Number" value={phone} onChange={(e) => setPhone(e.target.value)} />
        <Select defaultValue={role} onValueChange={(val) => setRole(val)}>
          <SelectTrigger>
            <SelectValue placeholder="Select role" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="USER">User</SelectItem>
            <SelectItem value="ORGANIZER">Trip Organizer</SelectItem>
          </SelectContent>
        </Select>
        {confirmation && (
          <Input placeholder="OTP" value={otp} onChange={(e) => setOtp(e.target.value)} />
        )}
        <div id="recaptcha-container"></div>
      </CardContent>
      <CardFooter>
        {confirmation ? (
          <Button className="w-full" onClick={verifyOtp}>Verify &amp; Sign Up</Button>
        ) : (
          <Button className="w-full" onClick={sendOtp}>Send OTP</Button>
        )}
      </CardFooter>
    </Card>
  );
}
