
import * as React from 'react';
import Link from 'next/link';
import { redirect } from 'next/navigation';

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Users, ShieldCheck, Briefcase, AlertTriangle, ListChecks, Banknote, CheckCircle, Loader2 } from "lucide-react";
import { ClientOnlyDate } from '@/components/common/ClientOnlyDate';
import type { UserSession } from '@/lib/types';
import { cookies } from 'next/headers';

// Server-side data fetching function
async function getDashboardData(token: string) {
  const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || ''}/api/admin/dashboard`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  if (!res.ok) throw new Error('Failed to load dashboard');
  return res.json();
}


export default async function AdminDashboardPage() {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get('userSession');
    const tokenCookie = cookieStore.get('authToken');

    if (!sessionCookie) {
        redirect('/auth/login');
    }

    const session: UserSession = JSON.parse(sessionCookie.value);
    const allowedRoles: UserSession['role'][] = [
        'Super Admin',
        'Finance Manager',
        'Operations Manager',
        'Support Agent',
    ];

    if (!session || !allowedRoles.includes(session.role)) {
        redirect('/auth/login');
    }

    const token = tokenCookie?.value || '';
    const dashboardData = await getDashboardData(token);

    return (
        <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
          <h1 className="text-3xl md:text-4xl font-headline font-bold tracking-tight">
            Dashboard
          </h1>
          <div className="grid gap-4 md:grid-cols-2 md:gap-8 lg:grid-cols-4">
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                    <span className="text-muted-foreground">₹</span>
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">₹{dashboardData.totalRevenue.toLocaleString('en-IN')}</div>
                    <p className="text-xs text-muted-foreground">
                    +20.1% from last month
                    </p>
                </CardContent>
            </Card>
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                    <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">+{dashboardData.totalUsers}</div>
                    <p className="text-xs text-muted-foreground">
                    +180.1% from last month
                    </p>
                </CardContent>
            </Card>
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Organisers</CardTitle>
                    <ShieldCheck className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">+{dashboardData.totalOrganizers}</div>
                    <p className="text-xs text-muted-foreground">
                    +19% from last month
                    </p>
                </CardContent>
            </Card>
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Bookings</CardTitle>
                    <Briefcase className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">+{dashboardData.totalBookings}</div>
                    <p className="text-xs text-muted-foreground">
                    +19% from last month
                    </p>
                </CardContent>
            </Card>
          </div>
    
          <div className="grid gap-4 md:grid-cols-2 md:gap-8">
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <AlertTriangle className="h-6 w-6 text-amber-500" />
                      <span>Pending Actions</span>
                    </CardTitle>
                    <CardDescription>Items that require your immediate attention.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {dashboardData.totalPending > 0 ? (
                      <>
                          {dashboardData.pendingKycs > 0 && (
                              <div className="flex items-center justify-between rounded-lg border bg-background/50 p-4">
                                  <div className="flex items-center gap-3">
                                      <ShieldCheck className="h-6 w-6 text-muted-foreground" />
                                      <div>
                                          <p className="font-medium">{dashboardData.pendingKycs} Trip Organiser KYC approval{dashboardData.pendingKycs > 1 ? 's' : ''} pending.</p>
                                          <p className="text-sm text-muted-foreground">Review their documents and agreement to approve them.</p>
                                      </div>
                                  </div>
                                  <Link href="/admin/trip-organisers">
                                      <Button variant="outline">Review KYC</Button>
                                  </Link>
                              </div>
                          )}
                          {dashboardData.pendingTrips > 0 && (
                              <div className="flex items-center justify-between rounded-lg border bg-background/50 p-4">
                                  <div className="flex items-center gap-3">
                                      <ListChecks className="h-6 w-6 text-muted-foreground" />
                                      <div>
                                          <p className="font-medium">{dashboardData.pendingTrips} Trip listing{dashboardData.pendingTrips > 1 ? 's' : ''} awaiting approval.</p>
                                          <p className="text-sm text-muted-foreground">Review new trips and batches before they go live.</p>
                                      </div>
                                  </div>
                                  <Link href="/admin/trips">
                                      <Button variant="outline">Review Trips</Button>
                                  </Link>
                              </div>
                          )}
                          {dashboardData.pendingPayouts > 0 && (
                              <div className="flex items-center justify-between rounded-lg border bg-background/50 p-4">
                                  <div className="flex items-center gap-3">
                                      <Banknote className="h-6 w-6 text-muted-foreground" />
                                      <div>
                                          <p className="font-medium">{dashboardData.pendingPayouts} Vendor Payout{dashboardData.pendingPayouts > 1 ? 's' : ''} pending processing.</p>
                                          <p className="text-sm text-muted-foreground">Process pending payout requests from vendors.</p>
                                      </div>
                                  </div>
                                  <Link href="/admin/payouts">
                                      <Button variant="outline">Process Payouts</Button>
                                  </Link>
                              </div>
                          )}
                      </>
                  ) : (
                      <div className="flex flex-col items-center justify-center text-center p-8">
                          <CheckCircle className="h-12 w-12 text-green-500 mb-4" />
                          <h3 className="text-xl font-semibold">All caught up!</h3>
                          <p className="text-muted-foreground">There are no pending actions at this time.</p>
                      </div>
                  )}
                </CardContent>
            </Card>
            
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Users className="h-6 w-6 text-primary" />
                        <span>Referral Program Snapshot</span>
                    </CardTitle>
                    <CardDescription>Quick overview of the referral program's performance.</CardDescription>
                </CardHeader>
                <CardContent className="grid grid-cols-2 gap-4">
                    <div className="space-y-1 rounded-lg border bg-background/50 p-4">
                        <p className="text-sm font-medium text-muted-foreground">Total Signups</p>
                        <p className="text-2xl font-bold">1,254</p>
                    </div>
                    <div className="space-y-1 rounded-lg border bg-background/50 p-4">
                        <p className="text-sm font-medium text-muted-foreground">Bookings</p>
                        <p className="text-2xl font-bold">312</p>
                    </div>
                    <div className="space-y-1 rounded-lg border bg-background/50 p-4">
                        <p className="text-sm font-medium text-muted-foreground">Credits Awarded</p>
                        <p className="text-2xl font-bold">₹25,600</p>
                    </div>
                    <div className="space-y-1 rounded-lg border bg-background/50 p-4">
                        <p className="text-sm font-medium text-muted-foreground">Conversion Rate</p>
                        <p className="text-2xl font-bold">24.8%</p>
                    </div>
                </CardContent>
                <CardFooter>
                    <Button variant="outline" asChild>
                    <Link href="/admin/reports">View Full Analytics</Link>
                    </Button>
                </CardFooter>
            </Card>
          </div>
    
           <Card>
            <CardHeader>
              <CardTitle>Recent Bookings</CardTitle>
              <CardDescription>An overview of recent booking activities on the platform.</CardDescription>
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader>
                    <TableRow>
                        <TableHead>User</TableHead>
                        <TableHead>Trip</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead className="text-right">Amount</TableHead>
                    </TableRow>
                    </TableHeader>
                    <TableBody>
                    {dashboardData.recentBookings.map((booking: any) => (
                        <TableRow key={booking.id}>
                        <TableCell className="font-medium">{booking.userName}</TableCell>
                        <TableCell>{booking.tripTitle}</TableCell>
                        <TableCell>
                            <ClientOnlyDate dateString={booking.bookingDate} type="date"/>
                        </TableCell>
                        <TableCell className={`text-right font-mono`}>
                            ₹{booking.amount.toLocaleString('en-IN')}
                        </TableCell>
                        </TableRow>
                    ))}
                    </TableBody>
                </Table>
            </CardContent>
          </Card>
        </main>
    );
}
