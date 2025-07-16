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

export default function SignupPage() {
  const { toast } = useToast();
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("USER");
  const [confirmation, setConfirmation] = useState<ConfirmationResult | null>(null);
import { Loader2 } from "lucide-react";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";


const SignupFormSchema = z.object({
  name: z.string().min(3, "Full name must be at least 3 characters."),
  email: z.string().email("Please enter a valid email address."),
  password: z.string().min(6, "Password must be at least 6 characters."),
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

  const form = useForm<SignupFormData>({
    resolver: zodResolver(SignupFormSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      accountType: "USER",
      referralCode: "",
      terms: false,
    },
  });

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

      const payload = data;
      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Signup failed.');
      }

      toast({
        title: "Account Created!",
        description: "Your account has been created successfully. Please log in to continue.",
      });
      router.push('/auth/login');

  const verifyOtp = async () => {
    if (!confirmation) return;
    try {
      const cred = await confirmation.confirm(otp);
      const idToken = await cred.user.getIdToken();
      const res = await fetch("/api/auth/signup", {
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
            <FormField control={form.control} name="email" render={({ field }) => (<FormItem><FormLabel>Email Address</FormLabel><FormControl><Input type="email" placeholder="m@example.com" {...field} /></FormControl><FormMessage /></FormItem>)} />
            <FormField control={form.control} name="password" render={({ field }) => (<FormItem><FormLabel>Password</FormLabel><FormControl><Input type="password" placeholder="******" {...field} /></FormControl><FormMessage /></FormItem>)} />
            
            <FormField control={form.control} name="referralCode" render={({ field }) => (<FormItem><FormLabel>Referral Code (Optional)</FormLabel><FormControl><Input placeholder="Enter referral code" {...field} /></FormControl><FormMessage /></FormItem>)} />
            
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
                Create Account
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
    </Card>
  );
}
