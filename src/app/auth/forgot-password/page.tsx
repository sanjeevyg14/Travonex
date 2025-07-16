import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ArrowLeft } from "lucide-react";

export default function ForgotPasswordPage() {
  return (
    <Card className="w-full max-w-sm shadow-2xl">
      <CardHeader>
        <CardTitle className="text-2xl font-headline">Forgot Password?</CardTitle>
        <CardDescription>
          Please return to the login page and use your email and password to sign in.
        </CardDescription>
      </CardHeader>
      <CardContent className="grid gap-4">
        <p className="text-sm text-muted-foreground">
          Password reset is not required in this demo. Use the test credentials provided.
        </p>
      </CardContent>
      <div className="p-6 pt-0">
        <Link href="/auth/login">
            <Button className="w-full">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Sign In
            </Button>
        </Link>
      </div>
    </Card>
  );
}
