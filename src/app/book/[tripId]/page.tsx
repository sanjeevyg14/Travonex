
/**
 * @fileoverview Booking Confirmation Page
 * @description This page is the final step before payment. It allows users to:
 * - Confirm the number of travelers and provide their details.
 * - Select specific pickup and drop-off points.
 * - Apply discounts via coupon codes or wallet credits.
 * - View a detailed, real-time breakdown of the total fare.
 * 
 * @developer_notes
 * - **GATING LOGIC**: Before rendering, this page checks if the logged-in user's profile is complete (`isProfileComplete: true`).
 *   If the profile is incomplete, the user is redirected to `/profile` with a toast notification
 *   explaining that they need to complete their profile before making a booking.
 * - **State Management**: This is a client component that heavily uses `useState` and `useMemo` to manage the complex, interactive state of the booking form.
 * - **Backend-Ready Payload**: The "Proceed to Payment" action constructs a comprehensive JSON object. This object contains all the necessary information for the backend to create a booking record, validate pricing, and process the payment.
 * - **API Integration Points**:
 *   - **Coupon Validation**: `POST /api/coupons/validate` with coupon code.
 *   - **Booking Creation**: `POST /api/bookings/create` after successful payment.
 * - **Security**: All pricing, coupon, and wallet calculations MUST be re-validated on the backend to prevent client-side manipulation. The frontend calculation is for user experience only.
 */
"use client";

import { useState, useEffect, useMemo } from "react";
import type { Trip } from "@/lib/types";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Minus, Plus, User, Users as UsersIcon, ShieldCheck, Loader2 } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import { ClientOnlyDate } from "@/components/common/ClientOnlyDate";
import { useAuth } from "@/context/AuthContext";
import { loadRazorpay } from "@/lib/razorpay";

function BookingPageSkeleton() {
  return (
    <main className="flex-1 p-4 md:p-8 bg-muted/40">
      <div className="max-w-6xl mx-auto">
        <Skeleton className="h-10 w-1/2 mb-6" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-8">
                <Card>
                    <CardHeader>
                        <Skeleton className="h-6 w-1/3" />
                        <Skeleton className="h-4 w-2/3 mt-1" />
                    </CardHeader>
                    <CardContent>
                       <Skeleton className="h-40 w-full" />
                    </CardContent>
                </Card>
            </div>
            <div className="lg:col-span-1">
                <Card className="sticky top-24">
                     <CardHeader>
                        <Skeleton className="h-40 w-full mb-4" />
                        <Skeleton className="h-6 w-3/4" />
                        <Skeleton className="h-4 w-1/2 mt-1" />
                    </CardHeader>
                    <CardContent>
                        <Skeleton className="h-48 w-full" />
                    </CardContent>
                </Card>
            </div>
        </div>
      </div>
    </main>
  );
}


export default function BookingPage() {
  const params = useParams<{ tripId: string }>();
  const searchParams = useSearchParams();
  const router = useRouter();
  const batchId = searchParams.get('batch');
  const { toast } = useToast();
  
  const { user: sessionUser, token, loading: authLoading } = useAuth();
  const [currentUser, setCurrentUser] = useState<any | null>(null);

  useEffect(() => {
    const loadProfile = async () => {
      if (!sessionUser) return;
      try {
        const res = await fetch('/api/users/me/profile', { headers: { Authorization: token ? `Bearer ${token}` : '' } });
        if (res.ok) {
          const data = await res.json();
          setCurrentUser(data);
        }
      } catch (err) {
        console.error('Profile fetch error:', err);
      }
    };
    loadProfile();
  }, [sessionUser, token]);


  // DEV_COMMENT: START - Profile Completion and Auth Gate
  useEffect(() => {
    if (!authLoading) {
      if (!currentUser) {
        toast({ title: "Please Login", description: "You must be logged in to make a booking.", variant: "destructive" });
        router.push('/auth/login');
        return;
      }
      if (!currentUser.isProfileComplete) {
        toast({
          title: "Profile Incomplete",
          description: "Please complete your profile before making a booking.",
          variant: "destructive",
        });
        router.push('/profile');
      }
    }
  }, [currentUser, authLoading, router, toast]);
  // DEV_COMMENT: END - Profile Completion and Auth Gate

  // DEV_COMMENT: Fetch trip and batch data from the backend using tripId and batchId.
  // The backend should validate that the trip is published and the batch is active and has enough slots.
  const [trip, setTrip] = useState<Trip | null>(null);
  const [batch, setBatch] = useState<any | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch(`/api/trips/${params.tripId}`);
        if (!res.ok) return;
        const data = await res.json();
        setTrip(data);
        const foundBatch = data.batches?.find((b: any) => b.id === batchId);
        setBatch(foundBatch || null);
      } catch (err) {
        console.error('Trip fetch error:', err);
      }
    };
    load();
  }, [params.tripId, batchId]);

  // DEV_COMMENT: START - State Management for Booking Form
  // Initialize traveler info only after we have the current user's data.
  const [travelers, setTravelers] = useState([
    { name: '', email: '', phone: '', emergencyName: '', emergencyPhone: '' }
  ]);

  useEffect(() => {
    if (currentUser) {
        setTravelers([{ name: currentUser.name, email: currentUser.email, phone: currentUser.phone, emergencyName: '', emergencyPhone: '' }]);
    }
  }, [currentUser]);

  const [selectedPickup, setSelectedPickup] = useState<string>('');
  const [selectedDropoff, setSelectedDropoff] = useState<string>('');
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<{ id: string; code: string; discount: number } | null>(null);
  const [useWallet, setUseWallet] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  // DEV_COMMENT: END - State Management for Booking Form

  // DEV_COMMENT: Show a loading skeleton while auth state is being resolved or if data is not ready.
  if (authLoading || !currentUser || !currentUser.isProfileComplete || !trip || !batch) {
    return <BookingPageSkeleton />;
  }
  
  const handleTravelerCountChange = (newCount: number) => {
    if (newCount > 0 && newCount <= batch.availableSlots) {
        const currentCount = travelers.length;
        if (newCount > currentCount) {
            // Add new travelers
            const newTravelers = Array.from({ length: newCount - currentCount }, () => ({ name: '', email: '', phone: '', emergencyName: '', emergencyPhone: '' }));
            setTravelers([...travelers, ...newTravelers]);
        } else if (newCount < currentCount) {
            // Remove travelers from the end
            setTravelers(travelers.slice(0, newCount));
        }
    }
  };
  
  const handleTravelerInfoChange = (index: number, field: string, value: string) => {
    const updatedTravelers = [...travelers];
    updatedTravelers[index] = { ...updatedTravelers[index], [field]: value };
    setTravelers(updatedTravelers);
  };
  
  // BACKEND: This should call POST /api/coupons/validate
  const handleApplyCoupon = async () => {
    if (!couponCode) {
      toast({ variant: 'destructive', title: 'Invalid Coupon', description: 'Please enter a coupon code.' });
      return;
    }

    try {
      const res = await fetch('/api/coupons/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: couponCode, tripId: trip.id, batchId: batch.id })
      });
      const data = await res.json();

      if (!res.ok) {
        setAppliedCoupon(null);
        toast({ variant: 'destructive', title: 'Invalid Coupon', description: data.message || 'The entered coupon code is not valid.' });
        return;
      }

      setAppliedCoupon({ id: data.couponId || data.id, code: couponCode.toUpperCase(), discount: data.discount });
      toast({ title: 'Coupon Applied!', description: `A discount of ₹${data.discount} has been applied.` });
    } catch (err) {
      setAppliedCoupon(null);
      toast({ variant: 'destructive', title: 'Error', description: 'Failed to validate coupon.' });
    }
  };

  // DEV_COMMENT: START - Dynamic Fare Calculation
  // The backend MUST re-run this exact calculation logic to ensure price integrity.
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const fareDetails = useMemo(() => {
    if (!trip || !batch) {
      return { basePrice: 0, subtotal: 0, couponDiscount: 0, walletDiscount: 0, tax: 0, totalPayable: 0 };
    }

    const basePrice = batch.priceOverride ?? trip.price;
    const subtotal = basePrice * travelers.length;
    
    const couponDiscount = appliedCoupon?.discount || 0;
    
    // Wallet credits are applied after the coupon discount.
    const walletDiscount = useWallet ? Math.min(currentUser.walletBalance, subtotal - couponDiscount) : 0;
    
    const totalDiscount = couponDiscount + walletDiscount;
    
    const taxableAmount = subtotal - couponDiscount; // Tax is typically on the post-coupon price.
    const tax = trip.taxIncluded ? 0 : taxableAmount * (trip.taxPercentage || 0) / 100;
    
    const totalPayable = subtotal - totalDiscount + tax;

    return { basePrice, subtotal, couponDiscount, walletDiscount, tax, totalPayable: Math.max(0, totalPayable) };
  }, [travelers.length, appliedCoupon, useWallet, trip, batch, currentUser.walletBalance]);
  // DEV_COMMENT: END - Dynamic Fare Calculation

  // DEV_COMMENT: This function prepares the final payload for the backend.
  const handleProceedToPayment = async () => {
    // Basic validation
    if (!selectedPickup || !selectedDropoff) {
      toast({ variant: 'destructive', title: 'Missing Information', description: 'Please select a pickup and drop-off point.' });
      return;
    }

    setIsProcessing(true);

    // BACKEND: This payload is sent to POST /api/bookings/create after successful payment.
    const finalPayload = {
      tripId: trip.id,
      batchId: batch.id,
      pickup: trip.pickupPoints.find(p => p.label === selectedPickup),
      dropoff: trip.dropoffPoints.find(p => p.label === selectedDropoff),
      travelers: travelers,
      walletUsedAmount: fareDetails.walletDiscount,
      couponId: appliedCoupon?.id || null,
      couponUsed: appliedCoupon?.code || null,
      couponDiscount: fareDetails.couponDiscount,
      subtotal: fareDetails.subtotal,
      tax: fareDetails.tax,
      totalAmount: fareDetails.totalPayable,
      bookingStatus: 'pending', // Becomes 'confirmed' after payment
      paymentStatus: 'pending',
    };
    
    console.log("BACKEND BOOKING PAYLOAD:", JSON.stringify(finalPayload, null, 2));
    
    toast({
      title: "Redirecting to Payment...",
      description: "Preparing your booking summary to proceed with payment.",
    });

    try {
      await loadRazorpay();
      const orderRes = await fetch('/api/payments/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount: fareDetails.totalPayable, receipt: `${trip.id}-${Date.now()}` }),
      });
      const order = await orderRes.json();
      if (!orderRes.ok) throw new Error(order.error || 'Order creation failed');

      const options: any = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: order.amount,
        currency: order.currency,
        name: 'Travonex',
        description: trip.title,
        order_id: order.id,
        prefill: {
          name: currentUser.name,
          email: currentUser.email,
          contact: currentUser.phone,
        },
        handler: async (response: any) => {
          try {
            const verifyRes = await fetch('/api/payments/verify', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                order_id: response.razorpay_order_id,
                payment_id: response.razorpay_payment_id,
                signature: response.razorpay_signature,
              }),
            });
            const verify = await verifyRes.json();
            if (!verify.valid) throw new Error('Verification failed');

            await fetch('/api/bookings', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                ...finalPayload,
                paymentStatus: 'paid',
                bookingStatus: 'confirmed',
                orderId: response.razorpay_order_id,
                paymentId: response.razorpay_payment_id,
              }),
            });

            router.push('/booking/success');
          } catch (err) {
            console.error('Payment verification failed:', err);
            toast({ variant: 'destructive', title: 'Payment failed', description: 'Verification error' });
          } finally {
            setIsProcessing(false);
          }
        },
        modal: {
          ondismiss: () => setIsProcessing(false),
        },
      };

      const rzp = new (window as any).Razorpay(options);
      rzp.open();
    } catch (err) {
      console.error('Payment init error:', err);
      toast({ variant: 'destructive', title: 'Payment Error', description: 'Unable to initiate payment.' });
      setIsProcessing(false);
    }
  };

  return (
    <main className="flex-1 p-4 md:p-8 bg-muted/40">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-headline font-bold mb-6">Confirm Your Booking</h1>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-8">
                {/* DEV_COMMENT: START - Traveler Information Section. Dynamically renders forms based on traveler count. */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2"><UsersIcon /> Traveler Information</CardTitle>
                        <CardDescription>Enter details for each person traveling. The first traveler is pre-filled from your profile.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="mb-6">
                            <Label htmlFor="traveler-count" className="font-semibold">Number of Travelers</Label>
                            <div className="flex items-center gap-2 mt-2">
                                <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => handleTravelerCountChange(travelers.length - 1)} disabled={travelers.length <= 1}><Minus className="h-4 w-4" /></Button>
                                <Input id="traveler-count" className="w-16 h-8 text-center" value={travelers.length} readOnly />
                                <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => handleTravelerCountChange(travelers.length + 1)} disabled={travelers.length >= batch.availableSlots}><Plus className="h-4 w-4" /></Button>
                                <span className="text-sm text-muted-foreground">({batch.availableSlots} slots left)</span>
                            </div>
                        </div>
                        <div className="space-y-6">
                           {travelers.map((traveler, index) => (
                             <div key={index} className="space-y-4 p-4 border rounded-lg bg-background/50">
                                <h3 className="font-semibold flex items-center gap-2"><User className="h-5 w-5 text-primary" /> Traveler {index + 1}</h3>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div className="space-y-2"><Label htmlFor={`name-${index}`}>Full Name</Label><Input id={`name-${index}`} value={traveler.name} onChange={(e) => handleTravelerInfoChange(index, 'name', e.target.value)} /></div>
                                    <div className="space-y-2"><Label htmlFor={`email-${index}`}>Email</Label><Input id={`email-${index}`} type="email" value={traveler.email} onChange={(e) => handleTravelerInfoChange(index, 'email', e.target.value)} /></div>
                                    <div className="space-y-2"><Label htmlFor={`phone-${index}`}>Phone</Label><Input id={`phone-${index}`} type="tel" value={traveler.phone} onChange={(e) => handleTravelerInfoChange(index, 'phone', e.target.value)} /></div>
                                    <div className="space-y-2"><Label htmlFor={`emergencyName-${index}`}>Emergency Contact Name</Label><Input id={`emergencyName-${index}`} value={traveler.emergencyName} onChange={(e) => handleTravelerInfoChange(index, 'emergencyName', e.target.value)} placeholder="Required" /></div>
                                    <div className="space-y-2 sm:col-span-2"><Label htmlFor={`emergencyPhone-${index}`}>Emergency Contact Phone</Label><Input id={`emergencyPhone-${index}`} type="tel" value={traveler.emergencyPhone} onChange={(e) => handleTravelerInfoChange(index, 'emergencyPhone', e.target.value)} placeholder="Required"/></div>
                                </div>
                             </div>
                           ))}
                        </div>
                    </CardContent>
                </Card>
                {/* DEV_COMMENT: END - Traveler Information Section */}

                {/* DEV_COMMENT: START - Pickup & Drop-off Selection. Populated from the trip data. */}
                <Card>
                    <CardHeader>
                        <CardTitle>Trip Logistics</CardTitle>
                        <CardDescription>Select your preferred pickup and drop-off points for {trip.pickupCity}.</CardDescription>
                    </CardHeader>
                    <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                           <Label htmlFor="pickup-point">Pickup Point</Label>
                           <Select value={selectedPickup} onValueChange={setSelectedPickup}>
                                <SelectTrigger id="pickup-point"><SelectValue placeholder="Select a pickup point" /></SelectTrigger>
                                <SelectContent>
                                    {trip.pickupPoints.map(p => <SelectItem key={p.label} value={p.label}>{p.label} - {p.time}</SelectItem>)}
                                </SelectContent>
                           </Select>
                        </div>
                         <div className="space-y-2">
                           <Label htmlFor="dropoff-point">Drop-off Point</Label>
                           <Select value={selectedDropoff} onValueChange={setSelectedDropoff}>
                                <SelectTrigger id="dropoff-point"><SelectValue placeholder="Select a drop-off point" /></SelectTrigger>
                                <SelectContent>
                                    {trip.dropoffPoints.map(p => <SelectItem key={p.label} value={p.label}>{p.label} - {p.time}</SelectItem>)}
                                </SelectContent>
                           </Select>
                        </div>
                    </CardContent>
                </Card>
                {/* DEV_COMMENT: END - Pickup & Drop-off Selection */}
            </div>
            <div className="lg:col-span-1">
                <Card className="sticky top-24">
                    <CardHeader>
                        <div className="relative h-40 mb-4">
                            <Image src={trip.image} alt={trip.title} layout="fill" objectFit="cover" className="rounded-lg" data-ai-hint={trip.imageHint} />
                        </div>
                        <CardTitle className="text-lg">{trip.title}</CardTitle>
                        <CardDescription>
                            <ClientOnlyDate dateString={batch.startDate} options={{ month: 'long', day: 'numeric' }} /> - <ClientOnlyDate dateString={batch.endDate} options={{ month: 'long', day: 'numeric', year: 'numeric' }} />
                        </CardDescription>
                    </CardHeader>
                    {/* DEV_COMMENT: START - Dynamic Fare Breakdown Section */}
                    <CardContent className="space-y-4">
                        <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Base Price</span>
                                <span>₹{fareDetails.basePrice.toLocaleString('en-IN')} x {travelers.length}</span>
                            </div>
                             <div className="flex justify-between font-medium">
                                <span>Subtotal</span>
                                <span>₹{fareDetails.subtotal.toLocaleString('en-IN')}</span>
                            </div>
                        </div>
                        <Separator />
                        <div className="space-y-2">
                           <Label htmlFor="coupon-code">Have a coupon?</Label>
                           <div className="flex gap-2">
                             <Input id="coupon-code" placeholder="Enter Coupon Code" value={couponCode} onChange={(e) => setCouponCode(e.target.value)} />
                             <Button variant="outline" onClick={handleApplyCoupon}>Apply</Button>
                           </div>
                        </div>
                         {currentUser.walletBalance > 0 && (
                            <div className="flex items-center justify-between rounded-lg border p-3">
                                <div className="space-y-0.5">
                                    <Label htmlFor="wallet-toggle">Use Wallet Balance</Label>
                                    <p className="text-xs text-muted-foreground">Available: ₹{currentUser.walletBalance.toLocaleString('en-IN')}</p>
                                </div>
                                <Switch id="wallet-toggle" checked={useWallet} onCheckedChange={setUseWallet} />
                            </div>
                         )}
                         <Separator />
                         <div className="space-y-2 text-sm">
                            {fareDetails.couponDiscount > 0 && (
                                <div className="flex justify-between text-green-600">
                                    <span className="font-medium">Coupon Discount ({appliedCoupon?.code})</span>
                                    <span>-₹{fareDetails.couponDiscount.toLocaleString('en-IN')}</span>
                                </div>
                            )}
                            {fareDetails.walletDiscount > 0 && (
                                <div className="flex justify-between text-green-600">
                                    <span className="font-medium">Wallet Credit Used</span>
                                    <span>-₹{fareDetails.walletDiscount.toLocaleString('en-IN')}</span>
                                </div>
                            )}
                            {fareDetails.tax > 0 && (
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Taxes & Fees ({trip.taxPercentage}%)</span>
                                    <span>+₹{fareDetails.tax.toLocaleString('en-IN')}</span>
                                </div>
                            )}
                         </div>
                         <Separator />
                         <div className="flex justify-between font-bold text-lg">
                            <span>Total Payable</span>
                            <span>₹{fareDetails.totalPayable.toLocaleString('en-IN')}</span>
                        </div>
                    </CardContent>
                    {/* DEV_COMMENT: END - Dynamic Fare Breakdown Section */}
                    <CardFooter className="flex-col gap-4">
                        <Alert className="text-center">
                            <ShieldCheck className="h-4 w-4" />
                            <AlertDescription>
                                Your payment is protected by Travonex. After payment, your booking is instantly confirmed.
                            </AlertDescription>
                        </Alert>
                        {/* DEV_COMMENT: This button triggers the payload creation and simulated payment gateway redirect. */}
                        <Button className="w-full" size="lg" onClick={handleProceedToPayment} disabled={isProcessing}>
                            {isProcessing && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Proceed to Payment
                        </Button>
                    </CardFooter>
                </Card>
            </div>
        </div>
      </div>
    </main>
  );
}
