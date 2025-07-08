import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { MoveLeft } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function AdminMarketingPage() {
  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-4 p-4 md:gap-8 md:p-8">
        <Card className="max-w-md text-center">
            <CardHeader>
                <CardTitle>This Page Has Moved</CardTitle>
                <CardDescription>
                    All marketing and referral settings are now located in the main Platform Settings panel.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <Link href="/admin/settings">
                    <Button>
                        <MoveLeft className="mr-2 h-4 w-4" />
                        Go to Settings
                    </Button>
                </Link>
            </CardContent>
        </Card>
    </main>
  );
}
