/**
 * @fileoverview User & Organizer Signup Page
 * @description Handles new user and organizer registration.
 * 
 * @developer_notes
 * - Uses react-hook-form and Zod for robust validation.
 * - Allows users to select their account type (Traveler or Trip Organizer).
 * - Calls a new backend endpoint `/api/auth/signup` to create the account.
 * - After successful signup, redirects the user to the login page.
 */
"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
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
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Mail, Phone } from "lucide-react";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { auth } from "@/lib/firebase";
import { RecaptchaVerifier, signInWithPhoneNumber, ConfirmationResult, createUserWithEmailAndPassword, signOut } from "firebase/auth";


const SignupFormSchema = z.object({
  name: z.string().min(3, "Full name must be at least 3 characters."),
  email: z.string().email("Please enter a valid email address.").optional(),
  phone: z.string().min(10, "Please enter a valid 10-digit phone number.").optional(),
  accountType: z.enum(["USER", "ORGANIZER"], { required_error: "You must select an account type." }),
  referralCode: z.string().optional(),
  terms: z.literal(true, {
    errorMap: () => ({ message: "You must accept the terms and conditions." }),
  }),
});

type SignupFormData = z.infer<typeof SignupFormSchema>;

export default function SignupPage() {
  const { toast } = useToast();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [countryCode, setCountryCode] = useState('+91');

  const [signupMode, setSignupMode] = useState<'phone' | 'email'>('phone');
  const isEmailMode = signupMode === 'email';
  const recaptcha = useRef<RecaptchaVerifier>();
  const [confirmationResult, setConfirmationResult] = useState<ConfirmationResult | null>(null);
  const [otp, setOtp] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (!recaptcha.current) {
      recaptcha.current = new RecaptchaVerifier(auth, 'signup-recaptcha', { size: 'invisible' });
      // Render the reCAPTCHA widget so Firebase can send the OTP
      void recaptcha.current.render();
    }
  }, []);

  const form = useForm<SignupFormData>({
    resolver: zodResolver(SignupFormSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      accountType: "USER",
      referralCode: "",
      terms: false,
    },
  });

  const submitToBackend = async (uid: string, data: SignupFormData) => {
    const payload = { ...data, phone: `${countryCode}${data.phone}`, uid };
    const response = await fetch('/api/auth/signup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.message || 'Signup failed.');
    }
  };

  const handleSignup = async (data: SignupFormData) => {
    setIsLoading(true);
    try {
      if (signupMode === 'phone' && !data.phone) {
        throw new Error('Phone number is required for phone signup.');
      }
      if (signupMode === 'email' && !data.email) {
        throw new Error('Email is required for email signup.');
      }
      if (signupMode === 'phone') {
        if (!confirmationResult) {
          const fullPhone = `${countryCode}${data.phone}`;
          await recaptcha.current!.verify();
          const result = await signInWithPhoneNumber(auth, fullPhone, recaptcha.current!);
          setConfirmationResult(result);
          toast({ title: 'OTP Sent', description: `A verification code has been sent to ${fullPhone}.` });
          return;
        }
        if (otp.length !== 6) {
          throw new Error('Please enter the 6-digit OTP.');
        }
        const cred = await confirmationResult.confirm(otp);
        await submitToBackend(cred.user.uid, data);
        await signOut(auth);
        toast({
          title: 'Account Created!',
          description: 'You can now log in with your phone number.',
        });
        setTimeout(() => router.push('/auth/login'), 500);
      } else {
        if (password.length < 6) {
          throw new Error('Password must be at least 6 characters.');
        }
        if (password !== confirmPassword) {
          throw new Error('Passwords do not match.');
        }
        const cred = await createUserWithEmailAndPassword(auth, data.email, password);
        await submitToBackend(cred.user.uid, data);
        await signOut(auth);
        toast({
          title: 'Account Created!',
          description: 'Please log in to continue.',
        });
        setTimeout(() => router.push('/auth/login'), 500);
      }
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Signup Failed',
        description: error.message,
      });
    } finally {
      setIsLoading(false);
    }
  };


  return (
    <Card className="w-full max-w-sm shadow-2xl">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSignup)}>
          <CardHeader>
            <CardTitle className="text-2xl font-headline">Create an Account</CardTitle>
            <CardDescription>
              Enter your information to get started.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4">
            <div className="flex w-full items-center gap-2">
              <Button variant="outline" size="sm" type="button" onClick={() => setSignupMode(isEmailMode ? 'phone' : 'email')} className="ml-auto">
                {isEmailMode ? <Phone className="mr-2 h-4 w-4" /> : <Mail className="mr-2 h-4 w-4" />}
                Sign up with {isEmailMode ? 'Phone' : 'Email'}
              </Button>
            </div>
            
            <FormField
              control={form.control}
              name="accountType"
              render={({ field }) => (
                <FormItem className="space-y-3">
                  <FormLabel>I am a...</FormLabel>
                  <FormControl>
                    <RadioGroup
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      className="flex space-x-4"
                    >
                      <FormItem className="flex items-center space-x-2 space-y-0">
                        <FormControl>
                          <RadioGroupItem value="USER" />
                        </FormControl>
                        <FormLabel className="font-normal">Traveler</FormLabel>
                      </FormItem>
                      <FormItem className="flex items-center space-x-2 space-y-0">
                        <FormControl>
                          <RadioGroupItem value="ORGANIZER" />
                        </FormControl>
                        <FormLabel className="font-normal">Trip Organizer</FormLabel>
                      </FormItem>
                    </RadioGroup>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField control={form.control} name="name" render={({ field }) => (<FormItem><FormLabel>Full Name / Brand Name</FormLabel><FormControl><Input placeholder="John Doe" {...field} /></FormControl><FormMessage /></FormItem>)} />

            {isEmailMode && (
              <FormField control={form.control} name="email" render={({ field }) => (
                <FormItem>
                  <FormLabel>Email Address</FormLabel>
                  <FormControl>
                    <Input type="email" placeholder="m@example.com" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )} />
            )}

            {!isEmailMode && (
              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Phone Number</FormLabel>
                    <FormControl>
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
                                type="tel"
                                placeholder="98765 43210"
                                className="border-0 shadow-none pl-10 focus-visible:ring-0"
                                {...field}
                              />
                          </div>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}
            <FormField control={form.control} name="referralCode" render={({ field }) => (<FormItem><FormLabel>Referral Code (Optional)</FormLabel><FormControl><Input placeholder="Enter referral code" {...field} /></FormControl><FormMessage /></FormItem>)} />

            {isEmailMode && (
              <>
                <div className="grid gap-2">
                  <Label htmlFor="password">Password</Label>
                  <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="confirm">Confirm Password</Label>
                  <Input id="confirm" type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required />
                </div>
              </>
            )}

            {!isEmailMode && confirmationResult && (
              <div className="grid gap-2">
                <Label htmlFor="otp">One-Time Password (OTP)</Label>
                <Input id="otp" value={otp} onChange={(e) => setOtp(e.target.value)} maxLength={6} pattern="[0-9]*" required />
              </div>
            )}
            
            <FormField
              control={form.control}
              name="terms"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel>
                      I agree to the <Link href="/terms" className="underline hover:text-primary">Terms &amp; Conditions</Link>
                    </FormLabel>
                    <FormMessage />
                  </div>
                </FormItem>
              )}
            />
          </CardContent>
          <CardFooter className="flex flex-col gap-4">
            <Button className="w-full" type="submit" disabled={isLoading}>
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {signupMode === 'phone' ? (confirmationResult ? 'Verify & Create Account' : 'Send OTP') : 'Create Account'}
            </Button>
            <p className="text-center text-sm text-muted-foreground">
              Already have an account?{' '}
              <Link href="/auth/login" className="font-semibold text-primary hover:underline">
                Sign in
              </Link>
            </p>
          </CardFooter>
        </form>
      </Form>
      <div id="signup-recaptcha" />
    </Card>
  );
}
