import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowRight, ShieldCheck, LifeBuoy, Gift, FileText } from "lucide-react";
import Link from "next/link";

const benefits = [
    { icon: ShieldCheck, title: "Verified Trip Organizers", description: "Every organizer is vetted through strict KYC and quality checks." },
    { icon: ShieldCheck, title: "Secure Payments & Protection", description: "Your money is protected, and refunds are handled fairly." },
    { icon: LifeBuoy, title: "24x7 Support & Dispute Resolution", description: "Our team is always available to help, before, during, and after your trip." },
    { icon: Gift, title: "Cashback, Wallet Credits & Offers", description: "Enjoy loyalty rewards, referral bonuses, and exclusive platform-only deals." },
    { icon: FileText, title: "Transparent Booking & Tracking", description: "See your full booking history and manage your trips with ease." },
    { icon: ShieldCheck, title: "No Scams, No Hidden Costs", description: "Book confidently with verified prices and real-time availability." },
];

export function WhyBookBanner() {
    return (
        <Card className="bg-blue-50 border-blue-200 dark:bg-blue-950 dark:border-blue-800">
            <CardHeader className="text-center">
                <CardTitle className="text-2xl md:text-3xl font-headline">Why Book Through Travonex?</CardTitle>
                <CardDescription className="max-w-3xl mx-auto">
                    Booking directly with a trip organizer may seem convenient, but it comes with risks. When you book through Travonex, you’re guaranteed peace of mind.
                </CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                {benefits.map((benefit) => {
                    const Icon = benefit.icon;
                    return (
                        <div key={benefit.title} className="flex items-start gap-4">
                            <Icon className="h-8 w-8 text-blue-600 flex-shrink-0 mt-1" />
                            <div>
                                <h3 className="font-semibold">{benefit.title}</h3>
                                <p className="text-sm text-muted-foreground">{benefit.description}</p>
                            </div>
                        </div>
                    );
                })}
            </CardContent>
            <CardFooter className="flex-col items-center justify-center pt-6 text-center space-y-4">
                 <p className="text-xs text-muted-foreground max-w-lg">
                    <strong>Reminder:</strong> If you book outside the platform, we can’t assist you with refunds, support, or trip-related issues. Stay secure. Book through Travonex.
                </p>
                <Link href="/search">
                    <Button>
                        Explore All Trips <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                </Link>
            </CardFooter>
        </Card>
    );
}
