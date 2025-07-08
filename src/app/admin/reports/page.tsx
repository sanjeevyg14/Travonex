
/**
 * @fileoverview Admin Reports & Analytics Page
 *
 * @description
 * This page provides a high-level visual dashboard for Superadmins to analyze
 * platform performance, booking trends, and revenue data through charts and summaries.
 *
 * @developer_notes
 * - **API Integration**: This dashboard is read-only and should be powered by aggregated data from
 *   the backend. The main endpoint could be `GET /api/admin/reports/summary`.
 * - **Data Aggregation**: The backend should pre-aggregate data daily or on-demand to ensure
 *   this page loads quickly. This involves summing up bookings, revenue, etc., grouped by
 *   time periods, organizers, and cities.
 * - **Chart Library**: Uses `recharts` for data visualization.
 * - **Filtering**: The filters should update the query to the backend API, which will then
 *   return the filtered, aggregated data.
 */
"use client";

import * as React from "react";
import { Bar, BarChart, Line, LineChart, ResponsiveContainer, XAxis, YAxis, Tooltip, Legend } from "recharts";
import { Download, Users, Briefcase, MapPin, BarChart2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { DatePicker } from "@/components/ui/datepicker";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { organizers, cities } from "@/lib/mock-data";


const monthlyChartData = [
  { month: "Jan", bookings: 186, revenue: 186000 },
  { month: "Feb", bookings: 305, revenue: 305000 },
  { month: "Mar", bookings: 237, revenue: 237000 },
  { month: "Apr", bookings: 73, revenue: 73000 },
  { month: "May", bookings: 209, revenue: 209000 },
  { month: "Jun", bookings: 214, revenue: 214000 },
  { month: "Jul", bookings: 361, revenue: 361855 },
];

const categoryChartData = [
    { category: 'Adventure', bookings: 120 },
    { category: 'Cultural', bookings: 90 },
    { category: 'Relaxation', bookings: 75 },
    { category: 'Spiritual', bookings: 50 },
    { category: 'Trek', bookings: 45 },
]

const monthlyChartConfig = {
  revenue: { label: "Revenue", color: "hsl(var(--primary))" },
  bookings: { label: "Bookings", color: "hsl(var(--accent))" },
} satisfies ChartConfig;

const categoryChartConfig = {
    bookings: { label: "Bookings", color: "hsl(var(--primary))" },
} satisfies ChartConfig;

// DEV_COMMENT: Mock values for display. In a real app, these would come from the API.
const mockTotalRevenue = 1234567;
const mockTotalBookings = 1234;
const mockNewUsers = 573;
const mockAvgBookingValue = 2450;


export default function AdminReportsPage() {
  const [dateRange, setDateRange] = React.useState<{from?: Date, to?: Date}>({});

  return (
    <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
      <div className="space-y-2">
        <h1 className="text-3xl md:text-4xl font-headline font-bold tracking-tight">
          Reports & Analytics
        </h1>
        <p className="text-lg text-muted-foreground">
          Analyze platform performance, booking trends, and revenue data.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Filters</CardTitle>
          <CardDescription>Refine the analytics data shown on this page.</CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="flex flex-col space-y-2">
                <DatePicker date={dateRange.from} setDate={(date) => setDateRange(prev => ({...prev, from: date}))} placeholder="Start Date" />
            </div>
             <div className="flex flex-col space-y-2">
                <DatePicker date={dateRange.to} setDate={(date) => setDateRange(prev => ({...prev, to: date}))} placeholder="End Date" />
            </div>
            <Select>
                <SelectTrigger><SelectValue placeholder="Filter by Organizer" /></SelectTrigger>
                <SelectContent>
                    <SelectItem value="all">All Organizers</SelectItem>
                    {organizers.map(o => <SelectItem key={o.id} value={o.id}>{o.name}</SelectItem>)}
                </SelectContent>
            </Select>
            <Button variant="outline"><Download className="mr-2"/> Export Report (PDF)</Button>
        </CardContent>
      </Card>
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <span className="text-muted-foreground">₹</span>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹{mockTotalRevenue.toLocaleString('en-IN')}</div>
            <p className="text-xs text-muted-foreground">in selected period</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Bookings</CardTitle>
            <Briefcase className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">+{mockTotalBookings.toLocaleString('en-IN')}</div>
            <p className="text-xs text-muted-foreground">+12.1% from last period</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">New Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">+{mockNewUsers.toLocaleString('en-IN')}</div>
            <p className="text-xs text-muted-foreground">in selected period</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg. Booking Value</CardTitle>
            <BarChart2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹{mockAvgBookingValue.toLocaleString('en-IN')}</div>
            <p className="text-xs text-muted-foreground">per traveler</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
         <Card>
            <CardHeader>
            <CardTitle>Booking & Revenue Trends</CardTitle>
            <CardDescription>Monthly breakdown of bookings and gross revenue.</CardDescription>
            </CardHeader>
            <CardContent>
            <ChartContainer config={monthlyChartConfig} className="min-h-[300px] w-full">
                <LineChart data={monthlyChartData}>
                    <XAxis dataKey="month" tickLine={false} tickMargin={10} axisLine={false} />
                    <YAxis yAxisId="left" stroke="var(--color-revenue)" tickFormatter={(value) => `₹${Number(value) / 1000}k`} />
                    <YAxis yAxisId="right" orientation="right" stroke="var(--color-bookings)" tickFormatter={(value) => `${value}`}/>
                    <Tooltip content={<ChartTooltipContent />} />
                    <Legend />
                    <Line yAxisId="left" type="monotone" dataKey="revenue" stroke="var(--color-revenue)" strokeWidth={2} dot={false} />
                    <Line yAxisId="right" type="monotone" dataKey="bookings" stroke="var(--color-bookings)" strokeWidth={2} dot={false} />
                </LineChart>
                </ChartContainer>
            </CardContent>
        </Card>
         <Card>
            <CardHeader>
                <CardTitle>Bookings by Trip Category</CardTitle>
                <CardDescription>Performance of different trip categories.</CardDescription>
            </CardHeader>
            <CardContent>
                <ChartContainer config={categoryChartConfig} className="min-h-[300px] w-full">
                     <BarChart data={categoryChartData} layout="vertical">
                        <XAxis type="number" hide />
                        <YAxis dataKey="category" type="category" tickLine={false} axisLine={false} tickMargin={10} width={80} />
                        <Tooltip content={<ChartTooltipContent />} />
                        <Legend />
                        <Bar dataKey="bookings" fill="var(--color-bookings)" radius={4} />
                    </BarChart>
                </ChartContainer>
            </CardContent>
        </Card>
      </div>
    </main>
  );
}
