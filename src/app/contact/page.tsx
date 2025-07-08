import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export default function ContactUsPage() {
  return (
    <main className="flex flex-1 flex-col items-center gap-4 p-4 md:gap-8 md:p-8">
      <div className="space-y-2 text-center">
        <h1 className="text-4xl md:text-5xl font-headline font-bold tracking-tight">
          Get in Touch
        </h1>
        <p className="text-lg text-muted-foreground max-w-xl mx-auto">
          Have a question, feedback, or a partnership inquiry? We'd love to hear from you.
        </p>
      </div>

      <Card className="w-full max-w-2xl mt-8">
        <CardHeader>
          <CardTitle>Send us a Message</CardTitle>
          <CardDescription>
            Fill out the form below and our team will get back to you as soon as possible.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <Input id="name" placeholder="John Doe" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <Input id="email" type="email" placeholder="john.doe@example.com" />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="subject">Subject</Label>
            <Input id="subject" placeholder="e.g., Question about a trip" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="message">Message</Label>
            <Textarea id="message" placeholder="Your message here..." rows={6} />
          </div>
        </CardContent>
        <CardFooter>
          <Button>Send Message</Button>
        </CardFooter>
      </Card>
    </main>
  );
}
