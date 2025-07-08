

"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { PlusCircle, Loader2 } from "lucide-react";
import * as React from 'react';
import { useToast } from "@/hooks/use-toast";

// DEV_COMMENT: Mock data for notification templates
const mockTemplates = [
    { id: 'booking_confirmation', name: 'Booking Confirmation', channel: 'Email & WhatsApp', status: 'Active' },
    { id: 'refund_processed', name: 'Refund Processed', channel: 'Email', status: 'Active' },
    { id: 'trip_cancelled', name: 'Trip Cancelled by Organizer', channel: 'Email & SMS', status: 'Inactive' },
    { id: 'kyc_approved', name: 'Organizer KYC Approved', channel: 'Email', status: 'Active' },
];


export default function AdminSettingsPage() {
    const { toast } = useToast();
    const [isSaving, setIsSaving] = React.useState<string | null>(null);
    
    // DEV_COMMENT: State management for the feature toggles has been added to make them functional.
    const [toggles, setToggles] = React.useState({
        bookings: true,
        onboarding: true,
        referrals: true,
        reviews: true,
        wallet: true,
        maintenance: false,
    });
    
    const handleToggleChange = (feature: keyof typeof toggles, checked: boolean) => {
        setToggles(prev => ({...prev, [feature]: checked}));
    };

    // DEV_COMMENT: This function simulates saving settings for a specific section.
    // In a real app, it would call a dedicated backend endpoint for each section.
    const handleSave = async (section: string) => {
        setIsSaving(section);
        // BACKEND: Call API to save settings for this section, e.g., PUT /api/admin/settings/{section}
        // This delay is to simulate network latency.
        if (section === 'features') {
            console.log("Saving feature toggles:", toggles);
        }
        await new Promise(resolve => setTimeout(resolve, 500));
        setIsSaving(null);
        toast({
            title: "Settings Saved",
            description: `Your changes to the ${section} section have been saved.`,
        });
    }

  return (
    <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
      <div className="space-y-2">
        <h1 className="text-3xl md:text-4xl font-headline font-bold tracking-tight">
          Platform Settings
        </h1>
        <p className="text-lg text-muted-foreground">
          Manage and configure all aspects of the Travonex platform.
        </p>
      </div>

      <Tabs defaultValue="general" className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="legal">Legal</TabsTrigger>
          <TabsTrigger value="referrals">Referrals & Tax</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="mt-6 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Platform Defaults</CardTitle>
              <CardDescription>Manage general platform configurations and contact information.</CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="support-email">Support Email</Label>
                <Input id="support-email" type="email" defaultValue="support@travonex.com" />
              </div>
               <div className="space-y-2">
                <Label htmlFor="support-phone">Support Phone</Label>
                <Input id="support-phone" type="tel" defaultValue="+91 12345 67890" />
              </div>
               <div className="space-y-2">
                <Label htmlFor="platform-fee">Default Commission (%)</Label>
                <Input id="platform-fee" type="number" defaultValue="10" />
              </div>
               <div className="space-y-2">
                <Label htmlFor="currency-format">Currency</Label>
                 <Select defaultValue="INR">
                  <SelectTrigger id="currency-format"><SelectValue placeholder="Select currency" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="INR">INR (₹)</SelectItem>
                    <SelectItem value="USD">USD ($)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
             <CardFooter>
              <Button onClick={() => handleSave('general')} disabled={!!isSaving}>
                {isSaving === 'general' && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Save Platform Defaults
              </Button>
            </CardFooter>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Global Alert Banner</CardTitle>
              <CardDescription>Manage the announcement banner displayed at the top of the user-facing site.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between rounded-lg border p-4">
                <div className="space-y-0.5">
                  <Label htmlFor="enable-banner" className="font-medium">Enable Global Banner</Label>
                  <p className="text-sm text-muted-foreground">Toggle the visibility of the banner sitewide.</p>
                </div>
                <Switch id="enable-banner" defaultChecked />
              </div>
              <div className="space-y-2">
                <Label htmlFor="banner-title">Banner Title</Label>
                <Input id="banner-title" defaultValue="Special Announcement!" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="banner-desc">Banner Description</Label>
                <Textarea id="banner-desc" defaultValue="We are running a special monsoon discount on all trips to Goa. Use code MONSOON20 to get 20% off!" />
              </div>
            </CardContent>
            <CardFooter>
              <Button onClick={() => handleSave('banner')} disabled={!!isSaving}>
                {isSaving === 'banner' && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Save Banner Settings
              </Button>
            </CardFooter>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Feature Toggles</CardTitle>
              <CardDescription>Enable or disable major features across the platform.</CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center justify-between rounded-lg border p-4">
                    <Label htmlFor="enable-bookings" className="font-medium">Enable Trip Bookings</Label>
                    <Switch id="enable-bookings" checked={toggles.bookings} onCheckedChange={(checked) => handleToggleChange('bookings', checked)} />
                </div>
                 <div className="flex items-center justify-between rounded-lg border p-4">
                    <Label htmlFor="enable-onboarding" className="font-medium">Enable Organizer Onboarding</Label>
                    <Switch id="enable-onboarding" checked={toggles.onboarding} onCheckedChange={(checked) => handleToggleChange('onboarding', checked)} />
                </div>
                 <div className="flex items-center justify-between rounded-lg border p-4">
                    <Label htmlFor="enable-referrals" className="font-medium">Enable Referral Program</Label>
                    <Switch id="enable-referrals" checked={toggles.referrals} onCheckedChange={(checked) => handleToggleChange('referrals', checked)} />
                </div>
                 <div className="flex items-center justify-between rounded-lg border p-4">
                    <Label htmlFor="enable-reviews" className="font-medium">Enable Reviews & Ratings</Label>
                    <Switch id="enable-reviews" checked={toggles.reviews} onCheckedChange={(checked) => handleToggleChange('reviews', checked)} />
                </div>
                 <div className="flex items-center justify-between rounded-lg border p-4">
                    <Label htmlFor="enable-wallet" className="font-medium">Enable User Wallet</Label>
                    <Switch id="enable-wallet" checked={toggles.wallet} onCheckedChange={(checked) => handleToggleChange('wallet', checked)} />
                </div>
                <div className="flex items-center justify-between rounded-lg border p-4 bg-amber-50 border-amber-200">
                    <Label htmlFor="maintenance-mode" className="font-medium text-amber-900">Enable Maintenance Mode</Label>
                    <Switch id="maintenance-mode" checked={toggles.maintenance} onCheckedChange={(checked) => handleToggleChange('maintenance', checked)} />
                </div>
            </CardContent>
             <CardFooter>
                <Button onClick={() => handleSave('features')} disabled={!!isSaving}>
                    {isSaving === 'features' && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Save Feature Toggles
                </Button>
            </CardFooter>
          </Card>
        </TabsContent>
        
        <TabsContent value="legal" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Legal Documents</CardTitle>
              <CardDescription>Update the Terms of Service and Privacy Policy. These will be publicly visible.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="terms">Terms of Service</Label>
                <Textarea id="terms" rows={8} placeholder="Enter your Terms of Service..." />
              </div>
               <div className="space-y-2">
                <Label htmlFor="privacy">Privacy Policy</Label>
                <Textarea id="privacy" rows={8} placeholder="Enter your Privacy Policy..." />
              </div>
            </CardContent>
            <CardFooter>
              <Button onClick={() => handleSave('legal')} disabled={!!isSaving}>
                {isSaving === 'legal' && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Save Legal Documents
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="referrals" className="mt-6 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Referral Program</CardTitle>
              <CardDescription>Configure the referral bonus amounts for both the referrer and the new user (referee).</CardDescription>
            </CardHeader>
            <CardContent className="grid md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="referrer-bonus">Referrer Bonus (₹)</Label>
                <Input id="referrer-bonus" type="number" defaultValue="1500" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="referee-bonus">Referee Signup Bonus (₹)</Label>
                <Input id="referee-bonus" type="number" defaultValue="750" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="referee-discount">Referee First Booking Discount (%)</Label>
                <Input id="referee-discount" type="number" defaultValue="10" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="referee-min-booking">Minimum Booking for Referee Discount (₹)</Label>
                <Input id="referee-min-booking" type="number" defaultValue="5000" />
              </div>
            </CardContent>
            <CardFooter>
              <Button onClick={() => handleSave('referrals')} disabled={!!isSaving}>
                {isSaving === 'referrals' && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Save Referral Settings
              </Button>
            </CardFooter>
          </Card>
           <Card>
            <CardHeader>
              <CardTitle>Tax Settings</CardTitle>
              <CardDescription>Configure platform-wide tax rates.</CardDescription>
            </CardHeader>
            <CardContent className="grid md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="tax-rate">Default Tax Rate (%)</Label>
                <Input id="tax-rate" type="number" defaultValue="5.5" />
              </div>
               <div className="space-y-2">
                <Label htmlFor="gst-number">Company GST Number</Label>
                <Input id="gst-number" placeholder="e.g., 29ABCDE1234F1Z5" />
              </div>
            </CardContent>
            <CardFooter>
              <Button onClick={() => handleSave('tax')} disabled={!!isSaving}>
                {isSaving === 'tax' && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Save Tax Settings
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
        
        {/* DEV_COMMENT: START - Notification Templates Tab */}
        <TabsContent value="notifications" className="mt-6">
             <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                    <div>
                        <CardTitle>Notification Templates</CardTitle>
                        <CardDescription>Manage the content of automated emails, SMS, and WhatsApp alerts.</CardDescription>
                    </div>
                    <Button><PlusCircle className="mr-2"/> Create Template</Button>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Template Name</TableHead>
                                <TableHead>Channels</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {mockTemplates.map(template => (
                                <TableRow key={template.id}>
                                    <TableCell className="font-medium">{template.name}</TableCell>
                                    <TableCell>{template.channel}</TableCell>
                                    <TableCell><Switch checked={template.status === 'Active'} /></TableCell>
                                    <TableCell className="text-right">
                                        <Button variant="outline" size="sm">Edit</Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
             </Card>
        </TabsContent>
        {/* DEV_COMMENT: END - Notification Templates Tab */}

        <TabsContent value="security" className="mt-6">
           <Card>
            <CardHeader>
              <CardTitle>Security Settings</CardTitle>
              <CardDescription>Manage security policies for users and admins.</CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="session-timeout">Session Timeout (minutes)</Label>
                <Input id="session-timeout" type="number" defaultValue="60" />
              </div>
               <div className="space-y-2">
                <Label htmlFor="login-lockout">Failed Login Lockout (attempts)</Label>
                <Input id="login-lockout" type="number" defaultValue="5" />
              </div>
              <div className="flex items-center justify-between rounded-lg border p-4 md:col-span-2">
                    <Label htmlFor="enable-2fa" className="font-medium">Enable Two-Factor Authentication (2FA)</Label>
                    <Switch id="enable-2fa" />
                </div>
            </CardContent>
            <CardFooter>
              <Button onClick={() => handleSave('security')} disabled={!!isSaving}>
                {isSaving === 'security' && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Save Security Settings
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </main>
  );
}
