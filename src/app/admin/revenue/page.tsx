

"use client"

import * as React from "react";
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip, Legend } from "recharts";
import { Download, Users, Banknote, AlertCircle } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { DatePicker } from "@/components/ui/datepicker";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { organizers, trips, bookings, payouts } from "@/lib/mock-data";
import type { ChartConfig } from '@/components/ui/chart';
import { ClientOnlyDate } from "@/components/common/ClientOnlyDate";


// BACKEND:
// - All calculations below should be performed on the backend using aggregated queries.
// - Use confirmed/completed booking records to calculate gross revenue.
// - Pull commission % dynamically from system settings (e.g., 10%).
// - Link payout transactions for net payouts.
// - Add revenue audit logs for manual overrides or adjustments.
// - Optimize queries for date-range filters and aggregation.
// FUTURE: Add GST, TDS, or financial compliance summaries.

const chartData = [
  { month: "Jan", revenue: 186000, commission: 18600, payouts: 150000 },
  { month: "Feb", revenue: 305000, commission: 30500, payouts: 250000 },
  { month: "Mar", revenue: 237000, commission: 23700, payouts: 200000 },
  { month: "Apr", revenue: 73000, commission: 7300, payouts: 50000 },
  { month: "May", revenue: 209000, commission: 20900, payouts: 180000 },
  { month: "Jun", revenue: 214000, commission: 21400, payouts: 190000 },
  { month: "Jul", revenue: 361855, commission: 36185, payouts: 300000 },
];

const chartConfig = {
  revenue: { label: "Revenue", color: "hsl(var(--primary))" },
  commission: { label: "Commission", color: "hsl(var(--accent))" },
  payouts: { label: "Payouts", color: "hsl(var(--secondary))" },
} satisfies ChartConfig;

const totalRevenue = bookings.filter(b => b.status !== 'Cancelled').reduce((acc, b) => acc + b.amount, 0);
const totalCommission = totalRevenue * 0.10; // Assuming 10% commission
const totalPayouts = payouts.filter(p => p.status === 'Paid').reduce((acc, p) => acc + p.netPayout, 0);
const pendingPayouts = payouts.filter(p => p.status === 'Pending');
const pendingPayoutsValue = pendingPayouts.reduce((acc, p) => acc + p.netPayout, 0);

export default function AdminRevenuePage() {
  const [dateRange, setDateRange] = React.useState<{from?: Date, to?: Date}>({});

  const organizerRevenue = React.useMemo(() => {
    return organizers.map(org => {
      const orgTrips = trips.filter(t => t.organizerId === org.id);
      const orgTripIds = orgTrips.map(t => t.id);
      const orgBookings = bookings.filter(b => orgTripIds.includes(b.tripId) && b.status !== 'Cancelled');
      const orgRevenue = orgBookings.reduce((acc, b) => acc + b.amount, 0);
      const orgCommission = orgRevenue * 0.10;
      const orgPayouts = payouts.filter(p => p.organizerId === org.id);
      const paidPayouts = orgPayouts.filter(p => p.status === 'Paid').reduce((acc, p) => acc + p.netPayout, 0);
      const pendingPayouts = orgPayouts.filter(p => p.status === 'Pending').reduce((acc, p) => acc + p.netPayout, 0);
      const lastPayout = orgPayouts.filter(p=>p.status === 'Paid').sort((a,b) => new Date(b.paidDate as string).getTime() - new Date(a.paidDate as string).getTime())[0];

      return {
        ...org,
        totalRevenue: orgRevenue,
        commissionEarned: orgCommission,
        payoutsProcessed: paidPayouts,
        pendingPayouts,
        lastPayoutDate: lastPayout?.paidDate ? new Date(lastPayout.paidDate as string).toISOString() : 'N/A'
      }
    }).sort((a, b) => b.totalRevenue - a.totalRevenue);
  }, []);

  const topTrips = React.useMemo(() => {
     return trips.map(trip => {
      const tripBookings = bookings.filter(b => b.tripId === trip.id && b.status !== 'Cancelled');
      const grossRevenue = tripBookings.reduce((acc, b) => acc + b.amount, 0);
      return { ...trip, grossRevenue, bookingCount: tripBookings.length };
    }).sort((a,b) => b.grossRevenue - a.grossRevenue).slice(0, 5);
  }, []);

  return (
    <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
      <div className="space-y-2">
        <h1 className="text-3xl md:text-4xl font-headline font-bold tracking-tight">
          Revenue Dashboard
        </h1>
        <p className="text-lg text-muted-foreground">
          Track platform revenue, commissions, and visualize financial data.
        </p>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Filters &amp; Actions</CardTitle>
          <CardDescription>Use these filters to refine the data shown on this page.</CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="flex flex-col space-y-2">
                <DatePicker date={dateRange.from} setDate={(date) => setDateRange(prev => ({...prev, from: date}))} />
            </div>
             <div className="flex flex-col space-y-2">
                <DatePicker date={dateRange.to} setDate={(date) => setDateRange(prev => ({...prev, to: date}))} />
            </div>
            <Select>
                <SelectTrigger><SelectValue placeholder="Filter by Organizer" /></SelectTrigger>
                <SelectContent>
                    <SelectItem value="all">All Organizers</SelectItem>
                    {organizers.map(o => <SelectItem key={o.id} value={o.id}>{o.name}</SelectItem>)}
                </SelectContent>
            </Select>
            <div className="flex gap-2">
                {/* DEV_COMMENT: Backend for this would generate a CSV from the filtered data. */}
                <Button variant="outline" className="w-full"><Download className="mr-2 h-4 w-4" /> Export CSV</Button>
            </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <span className="text-muted-foreground">₹</span>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹{totalRevenue.toLocaleString('en-IN')}</div>
            <p className="text-xs text-muted-foreground">All time gross revenue</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Platform Commissions</CardTitle>
            <span className="text-muted-foreground">₹</span>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹{totalCommission.toLocaleString('en-IN')}</div>
            <p className="text-xs text-muted-foreground">All time commission earned</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Payouts</CardTitle>
            <Banknote className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹{totalPayouts.toLocaleString('en-IN')}</div>
            <p className="text-xs text-muted-foreground">Paid out to organizers</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Payouts</CardTitle>
            <AlertCircle className="h-4 w-4 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹{pendingPayoutsValue.toLocaleString('en-IN')}</div>
            <p className="text-xs text-muted-foreground">Across {pendingPayouts.length} requests</p>
          </CardContent>
        </Card>
      </div>
      
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
            <CardHeader>
            <CardTitle>Revenue & Commission Chart</CardTitle>
            <CardDescription>Monthly breakdown of gross revenue vs. commission earned.</CardDescription>
            </CardHeader>
            <CardContent>
            <ChartContainer config={chartConfig} className="min-h-[200px] w-full">
                <BarChart data={chartData}>
                    <XAxis dataKey="month" tickLine={false} tickMargin={10} axisLine={false} />
                    <YAxis tickFormatter={(value) => `₹${Number(value) / 1000}k`} />
                    <Tooltip content={<ChartTooltipContent />} />
                    <Legend />
                    <Bar dataKey="revenue" fill="var(--color-revenue)" radius={4} />
                    <Bar dataKey="commission" fill="var(--color-commission)" radius={4} />
                </BarChart>
                </ChartContainer>
            </CardContent>
        </Card>
         <Card>
            <CardHeader>
                <CardTitle>Top 5 Revenue-Generating Trips</CardTitle>
                <CardDescription>The most popular trips driving platform revenue.</CardDescription>
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Trip</TableHead>
                            <TableHead className="text-right">Revenue</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {topTrips.map(trip => (
                            <TableRow key={trip.id}>
                                <TableCell className="font-medium">{trip.title}</TableCell>
                                <TableCell className="text-right font-mono">₹{trip.grossRevenue.toLocaleString('en-IN')}</TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
      </div>

       <Card>
            <CardHeader>
                <CardTitle>Revenue by Trip Organizers</CardTitle>
                <CardDescription>Financial summary for each trip organizer.</CardDescription>
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Organizer</TableHead>
                            <TableHead className="text-right">Total Revenue</TableHead>
                            <TableHead className="text-right">Commission Earned</TableHead>
                            <TableHead className="text-right">Payouts Processed</TableHead>
                            <TableHead className="text-right">Pending Payouts</TableHead>
                            <TableHead>Last Payout</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {organizerRevenue.map(org => (
                            <TableRow key={org.id}>
                                <TableCell className="font-medium">{org.name}</TableCell>
                                <TableCell className="text-right font-mono">₹{org.totalRevenue.toLocaleString('en-IN')}</TableCell>
                                <TableCell className="text-right font-mono">₹{org.commissionEarned.toLocaleString('en-IN')}</TableCell>
                                <TableCell className="text-right font-mono">₹{org.payoutsProcessed.toLocaleString('en-IN')}</TableCell>
                                <TableCell className="text-right font-mono">₹{org.pendingPayouts.toLocaleString('en-IN')}</TableCell>
                                <TableCell>
                                    {org.lastPayoutDate === 'N/A' ? (
                                        'N/A'
                                    ) : (
                                        <ClientOnlyDate dateString={org.lastPayoutDate} type="date" />
                                    )}
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
