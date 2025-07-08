import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function TermsOfServicePage() {
  return (
    <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
      <div className="max-w-4xl mx-auto w-full">
        <Card>
          <CardHeader>
            <CardTitle className="text-3xl font-headline">Terms of Service</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-muted-foreground">
            <p>Welcome to Travonex!</p>
            <p>These terms and conditions outline the rules and regulations for the use of Travonex's Website, located at travonex.com.</p>
            <p>By accessing this website we assume you accept these terms and conditions. Do not continue to use Travonex if you do not agree to take all of the terms and conditions stated on this page.</p>
            <h2 className="text-xl font-semibold text-foreground pt-4">Cookies</h2>
            <p>We employ the use of cookies. By accessing Travonex, you agreed to use cookies in agreement with the Travonex's Privacy Policy.</p>
            <h2 className="text-xl font-semibold text-foreground pt-4">License</h2>
            <p>Unless otherwise stated, Travonex and/or its licensors own the intellectual property rights for all material on Travonex. All intellectual property rights are reserved. You may access this from Travonex for your own personal use subjected to restrictions set in these terms and conditions.</p>
            <p>[...More legal text would go here...]</p>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
