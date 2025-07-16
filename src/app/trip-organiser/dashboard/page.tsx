
"use client";

import * as React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

import type { Organizer, Booking } from '@/lib/types';
import { useAuth } from '@/context/AuthContext';

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Users, Briefcase, AlertTriangle, FileText, PlusCircle, Loader2 } from "lucide-react";
import { ClientOnlyDate } from '@/components/common/ClientOnlyDate';
import { Skeleton } from '@/components/ui/skeleton';

interface DashboardData {
    totalRevenue: number;
    totalParticipants: number;
    activeTrips: number;
    kycStatus: Organizer['kycStatus'];
    recentBookings: (Booking & { customerName?: string; customerEmail?: string; tripTitle?: string })[];
}

function KycActionBanner({ kycStatus }: { kycStatus: Organizer['kycStatus'] }) {
    if (kycStatus === 'Verified') {
        return null;
    }
    
    const bannerConfig = {
        'Incomplete': {
            icon: FileText,
            title: 'Complete Your Profile',
            description: 'You must complete your profile and KYC verification to list new trips.',
            buttonText: 'Complete Profile & KYC',
        },
         'Pending': {
            icon: AlertTriangle,
            title: 'Verification Pending',
            description: 'Your profile is under review by our team. We will notify you once it is complete.',
            buttonText: 'View Profile Status',
        },
        'Rejected': {
            icon: AlertTriangle,
            title: 'Verification Rejected',
            description: 'Your profile verification was unsuccessful. Please review the feedback and resubmit your documents.',
            buttonText: 'Review Feedback',
        }
    };

    const config = bannerConfig[kycStatus as keyof typeof bannerConfig];
    if (!config) return null;

    return (
        <Alert variant={kycStatus === 'Rejected' ? 'destructive' : 'default'}>
            <config.icon className="h-4 w-4" />
            <AlertTitle>{config.title}</AlertTitle>
            <AlertDescription className="flex items-center justify-between">
                <span>{config.description}</span>
                <Link href="/trip-organiser/profile">
                    <Button variant="outline" size="sm">{config.buttonText}</Button>
                </Link>
            </AlertDescription>
        </Alert>
    );
}

function DashboardSkeleton() {
    return (
        <>
            <div className="grid gap-4 md:grid-cols-2 md:gap-8 lg:grid-cols-3">
                <Card><CardHeader><Skeleton className="h-5 w-2/3" /></CardHeader><CardContent><Skeleton className="h-8 w-1/2" /></CardContent></Card>
                <Card><CardHeader><Skeleton className="h-5 w-2/3" /></CardHeader><CardContent><Skeleton className="h-8 w-1/2" /></CardContent></Card>
                <Card><CardHeader><Skeleton className="h-5 w-2/3" /></CardHeader><CardContent><Skeleton className="h-8 w-1/2" /></CardContent></Card>
            </div>
             <Card>
                <CardHeader>
                    <Skeleton className="h-6 w-1/3 mb-2" />
                    <Skeleton className="h-4 w-2/3" />
                </CardHeader>
                <CardContent>
                   <div className="space-y-4">
                        <Skeleton className="h-10 w-full" />
                        <Skeleton className="h-10 w-full" />
                        <Skeleton className="h-10 w-full" />
                   </div>
                </CardContent>
            </Card>
        </>
    )
}

export default function OrganizerDashboardPage() {
    const { token } = useAuth();
    const router = useRouter();
    const [dashboardData, setDashboardData] = React.useState<DashboardData | null>(null);
    const [isLoading, setIsLoading] = React.useState(true);
    const [error, setError] = React.useState<string | null>(null);

    React.useEffect(() => {
        if (token) {
            const fetchDashboardData = async () => {
                setIsLoading(true);
                setError(null);
                try {
                    const response = await fetch('/api/organizers/me/dashboard', {
                        headers: { 'Authorization': `Bearer ${token}` }
                    });

                    const data = await response.json();

                    if (!response.ok) {
                        // Handle non-2xx responses gracefully
                        if (response.status === 403) {
                            // This is an expected "error" for unverified users. Handle it gracefully.
                            setDashboardData({ kycStatus: data.kycStatus } as DashboardData);
                        } else {
                             // For other errors, throw a clear error.
                             throw new Error(data.message || `Failed to fetch dashboard data. Status: ${response.status}.`);
                        }
                    } else {
                        setDashboardData(data);
                    }
                } catch (err: any) {
                    setError(err.message);
                } finally {
                    setIsLoading(false);
                }
            };
            fetchDashboardData();
        }
    }, [token, router]);

    if (isLoading) {
        return (
             <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
                <div className="space-y-2">
                    <Skeleton className="h-10 w-1/3" />
                </div>
                <DashboardSkeleton />
             </main>
        );
    }
    
    if (error) {
        return (
            <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
                <Alert variant="destructive">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertTitle>Error Loading Dashboard</AlertTitle>
                    <AlertDescription>{error}</AlertDescription>
                </Alert>
            </main>
        )
    }

    if (!dashboardData) {
        return <DashboardSkeleton />;
    }

    // If KYC is not verified, show the banner and a simplified view.
    if (dashboardData.kycStatus !== 'Verified') {
        return (
            <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
                <div className="space-y-2">
                    <h1 className="text-3xl md:text-4xl font-headline font-bold tracking-tight">
                        Dashboard
                    </h1>
                </div>
                <KycActionBanner kycStatus={dashboardData.kycStatus} />
                <Card>
                    <CardHeader><CardTitle>Welcome!</CardTitle></CardHeader>
                    <CardContent>
                        <p className="text-muted-foreground">Complete your profile to unlock your dashboard and start listing trips.</p>
                    </CardContent>
                </Card>
            </main>
        );
    }

    // Verified organizer view
    return (
        <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
            <div className="space-y-2">
                <h1 className="text-3xl md:text-4xl font-headline font-bold tracking-tight">
                    Dashboard
                </h1>
            </div>

            <div className="grid gap-4 md:grid-cols-2 md:gap-8 lg:grid-cols-3">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                    <span className="text-muted-foreground">₹</span>
                    </CardHeader>
                    <CardContent>
                    <div className="text-2xl font-bold">₹{dashboardData.totalRevenue.toLocaleString('en-IN')}</div>
                    <p className="text-xs text-muted-foreground">+20.1% from last month</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Participants</CardTitle>
                    <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                    <div className="text-2xl font-bold">+{dashboardData.totalParticipants}</div>
                    <p className="text-xs text-muted-foreground">+180.1% from last month</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Active Trips</CardTitle>
                    <Briefcase className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                    <div className="text-2xl font-bold">+{dashboardData.activeTrips}</div>
                    <p className="text-xs text-muted-foreground">Currently published trips</p>
                    </CardContent>
                </Card>
            </div>
            <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                    <div>
                        <CardTitle>Recent Bookings</CardTitle>
                        <CardDescription>An overview of the latest bookings for your trips.</CardDescription>
                    </div>
                    <Button asChild>
                        <Link href="/trip-organiser/trips/new"><PlusCircle className="mr-2"/> Create New Trip</Link>
                    </Button>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                        <TableRow>
                            <TableHead>Customer</TableHead>
                            <TableHead>Trip</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead className="text-right">Amount</TableHead>
                        </TableRow>
                        </TableHeader>
                        <TableBody>
                        {dashboardData.recentBookings.length > 0 ? dashboardData.recentBookings.map((booking) => (
                            <TableRow key={booking.id}>
                            <TableCell>
                                <div className="font-medium">{booking.customerName}</div>
                                <div className="text-sm text-muted-foreground">{booking.customerEmail}</div>
                            </TableCell>
                            <TableCell>{booking.tripTitle}</TableCell>
                            <TableCell>
                                <Badge variant={booking.status === 'Confirmed' ? 'default' : 'secondary'}>{booking.status}</Badge>
                            </TableCell>
                            <TableCell className="text-right font-mono">₹{booking.amount.toLocaleString('en-IN')}</TableCell>
                            </TableRow>
                        )) : (
                            <TableRow>
                                <TableCell colSpan={4} className="h-24 text-center">
                                    No recent bookings.
                                </TableCell>
                            </TableRow>
                        )}
                        </TableBody>
                    </Table>
                </CardContent>
                <CardFooter>
                    <Button asChild variant="outline">
                        <Link href="/trip-organiser/bookings">View All Bookings</Link>
                    </Button>
                </CardFooter>
            </Card>
        </main>
    );
}
