/**
 * @fileoverview Booking Success Page
 * @description This static page confirms to the user that their booking and payment were successful.
 * 
 * @developer_notes
 * - **Navigation Trigger**: This page should only be reached after a successful payment callback from the payment gateway.
 * - **Data**: The booking ID is not present here for simplicity, but a real application might pass it in the URL
 *   to fetch and display a brief summary of the confirmed booking.
 * - **Backend Requirement**: Upon successful payment, the backend should:
 *   1. Update the booking status from 'Pending' to 'Confirmed'.
 *   2. Send a confirmation email to the user with all trip details.
 *   3. Create a notification for the trip organizer about the new booking.
 */
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle, ArrowRight } from 'lucide-react';
import { Logo } from '@/components/common/Logo';
import { Alert, AlertDescription } from '@/components/ui/alert';

export default function BookingSuccessPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4 bg-muted/40">
        <div className="absolute top-8 left-8">
            <Logo />
        </div>
        <Card className="w-full max-w-lg text-center shadow-2xl p-8">
            <CardHeader className="items-center">
                <CheckCircle className="h-20 w-20 text-green-500 mb-4" />
                <CardTitle className="text-3xl font-headline">Booking Confirmed!</CardTitle>
                <CardDescription className="text-lg text-muted-foreground pt-2">
                    Your adventure is just around the corner.
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <p>
                    Thank you for your booking. A confirmation email with all your trip details has been sent to your registered email address.
                </p>
                 {/* DEV_COMMENT: Reinforces the value prop of booking through the platform. */}
                 <Alert className="text-center text-green-700 bg-green-50 border-green-200 [&>svg]:text-current">
                    <CheckCircle className="h-4 w-4" />
                    <AlertDescription>
                        You booked securely via Travonex. Your payment is protected and the organizer is verified.
                    </AlertDescription>
                </Alert>
                <p className="text-sm text-muted-foreground">
                    You can view and manage your booking from your dashboard.
                </p>
            </CardContent>
            <div className="flex flex-col sm:flex-row justify-center gap-4 mt-6">
                 <Link href="/bookings">
                    <Button>Go to My Bookings</Button>
                 </Link>
                 <Link href="/">
                    <Button variant="outline">Explore More Trips <ArrowRight className="ml-2 h-4 w-4" /></Button>
                 </Link>
            </div>
        </Card>
    </div>
  );
}
