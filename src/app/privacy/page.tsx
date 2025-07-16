import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function PrivacyPolicyPage() {
  return (
    <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
      <div className="max-w-4xl mx-auto w-full">
        <Card>
          <CardHeader>
            <CardTitle className="text-3xl font-headline">Privacy Policy</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-muted-foreground">
            <p>This Privacy Policy describes Our policies and procedures on the collection, use and disclosure of Your information when You use the Service and tells You about Your privacy rights and how the law protects You.</p>
            <p>We use Your Personal data to provide and improve the Service. By using the Service, You agree to the collection and use of information in accordance with this Privacy Policy.</p>
            <h2 className="text-xl font-semibold text-foreground pt-4">Collecting and Using Your Personal Data</h2>
            <p>While using Our Service, We may ask You to provide Us with certain personally identifiable information that can be used to contact or identify You. Personally identifiable information may include, but is not limited to: Email address, First name and last name, Phone number, Address, State, Province, ZIP/Postal code, City.</p>
            <p>[...More legal text would go here...]</p>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
