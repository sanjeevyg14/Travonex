

"use client";

import * as React from "react";
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
import { Gift, Upload, ArrowRight, ArrowLeft, AlertTriangle, Loader2, Shield } from "lucide-react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DatePicker } from "@/components/ui/datepicker";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { cn } from "@/lib/utils";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import type { User, WalletTransaction } from "@/lib/types";
import { ClientOnlyDate } from "@/components/common/ClientOnlyDate";
import { useAuth } from "@/context/AuthContext";


// DEV_COMMENT: Skeleton loader for the transaction history table.
const WalletHistorySkeleton = () => (
    <>
        {Array.from({ length: 3 }).map((_, i) => (
            <TableRow key={i}>
                <TableCell><Skeleton className="h-5 w-24" /></TableCell>
                <TableCell><Skeleton className="h-5 w-3/4" /></TableCell>
                <TableCell><Skeleton className="h-6 w-20 rounded-full" /></TableCell>
                <TableCell className="text-right"><Skeleton className="h-5 w-16 ml-auto" /></TableCell>
            </TableRow>
        ))}
    </>
);


export default function ProfilePage() {
  const { user: sessionUser, loading: authLoading } = useAuth();
  const [user, setUser] = React.useState<User | null>(null);
  const { toast } = useToast();
  const [dob, setDob] = React.useState<Date | undefined>();
  const [isSaving, setIsSaving] = React.useState(false);
  const [activeTab, setActiveTab] = React.useState("personal");
  const [walletTransactions, setWalletTransactions] = React.useState<WalletTransaction[]>([]);
  const [walletLoading, setWalletLoading] = React.useState(false);

  const fetchWalletTransactions = React.useCallback(async () => {
    setWalletLoading(true);
    try {
      const res = await fetch('/api/users/me/wallet-transactions', {
        headers: { Authorization: `Bearer ${localStorage.getItem('authToken')}` },
      });
      if (res.ok) {
        const data = await res.json();
        setWalletTransactions(data);
      }
    } catch (err) {
      console.error('Failed to load wallet transactions', err);
    } finally {
      setWalletLoading(false);
    }
  }, []);

  React.useEffect(() => {
    async function fetchProfile() {
      if (!sessionUser) return;
      try {
        const res = await fetch('/api/users/me/profile', {
          headers: { Authorization: `Bearer ${localStorage.getItem('authToken')}` },
        });
        if (res.ok) {
          const data = await res.json();
          setUser(data);
          setDob(data.dateOfBirth ? new Date(data.dateOfBirth) : undefined);
        }
      } catch (err) {
        console.error('Failed to load profile', err);
      }
    }
    fetchProfile();
  }, [sessionUser]);

  const handleSaveChanges = async () => {
    if (!user) return;
    setIsSaving(true);
    try {
      const res = await fetch('/api/users/me/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('authToken')}`,
        },
        body: JSON.stringify({ ...user, dateOfBirth: dob }),
      });
      if (res.ok) {
        toast({ title: 'Profile Updated', description: 'Your changes have been saved successfully.' });
      } else {
        const err = await res.json();
        toast({ title: 'Update failed', description: err.message || 'An error occurred.' });
      }
    } catch (err) {
      console.error('Profile update error', err);
      toast({ title: 'Update failed', description: 'An error occurred.' });
    } finally {
      setIsSaving(false);
    }
  }

  if (authLoading || !user) {
      return (
          <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
              <Skeleton className="h-10 w-1/3" />
              <Skeleton className="h-6 w-2/3" />
              <Card>
                  <CardHeader className="flex flex-row items-center gap-6 space-y-0">
                      <Skeleton className="h-24 w-24 rounded-full" />
                      <div className="space-y-2">
                           <Skeleton className="h-8 w-48" />
                           <Skeleton className="h-5 w-64" />
                      </div>
                  </CardHeader>
                  <CardContent>
                      <Skeleton className="h-10 w-full" />
                      <div className="pt-6">
                           <Skeleton className="h-40 w-full" />
                      </div>
                  </CardContent>
              </Card>
          </main>
      )
  }

  return (
    <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
      <div className="space-y-2">
        <h1 className="text-3xl md:text-4xl font-headline font-bold tracking-tight">
          Your Profile &amp; Wallet
        </h1>
        <p className="text-lg text-muted-foreground">
          Manage your personal information, preferences, and view your wallet activity.
        </p>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center gap-6 space-y-0">
            <div className="relative">
                <Avatar className="h-24 w-24">
                    <AvatarImage src={user.avatar} alt={user.name} data-ai-hint="person avatar" />
                    <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                </Avatar>
                  <Button size="icon" className="absolute -bottom-2 -right-2 h-8 w-8 rounded-full">
                    <Upload className="h-4 w-4" />
                    <span className="sr-only">Upload Picture</span>
                </Button>
            </div>
            <div>
                <CardTitle className="text-3xl">{user.name}</CardTitle>
                <CardDescription>{user.email}</CardDescription>
            </div>
        </CardHeader>
        <CardContent>
          <Tabs
            value={activeTab}
            onValueChange={(v) => {
              setActiveTab(v);
              if (v === 'wallet' && walletTransactions.length === 0) {
                fetchWalletTransactions();
              }
            }}
            className="w-full"
          >
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="personal">Personal</TabsTrigger>
              <TabsTrigger value="address">Address</TabsTrigger>
              <TabsTrigger value="preferences">Preferences</TabsTrigger>
              <TabsTrigger value="wallet">Wallet &amp; Referrals</TabsTrigger>
              <TabsTrigger value="security">Security</TabsTrigger>
            </TabsList>
            
            <TabsContent value="personal" className="pt-6">
                <div className="grid gap-6">
                    {/* DEV_COMMENT: Per business rules, Name and Phone are disabled. A notice is added below. */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="full-name">Full Name</Label>
                            <Input id="full-name" defaultValue={user.name} disabled />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="phone">Phone Number</Label>
                            <Input id="phone" type="tel" defaultValue={user.phone} disabled />
                        </div>
                    </div>
                    {/* DEV_COMMENT: START - Profile Editing Restriction Notice */}
                    <Alert>
                        <AlertTriangle className="h-4 w-4" />
                        <AlertTitle>Profile Information Locked</AlertTitle>
                        <AlertDescription>
                            To update your name, email, or phone number, please contact our support team at <a href="mailto:support@travonex.com" className="font-semibold underline">support@travonex.com</a> with verification proof.
                        </AlertDescription>
                    </Alert>
                    {/* DEV_COMMENT: END - Profile Editing Restriction Notice */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="gender">Gender</Label>
                            <Select defaultValue={user.gender}>
                                <SelectTrigger id="gender">
                                    <SelectValue placeholder="Select gender" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Male">Male</SelectItem>
                                    <SelectItem value="Female">Female</SelectItem>
                                    <SelectItem value="Non-binary">Non-binary</SelectItem>
                                    <SelectItem value="Prefer not to say">Prefer not to say</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="dob">Date of Birth</Label>
                            <DatePicker date={dob} setDate={setDob} />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="blood-group">Blood Group (For Emergency Use)</Label>
                            <Select defaultValue={user.bloodGroup}>
                                <SelectTrigger id="blood-group">
                                    <SelectValue placeholder="Select blood group" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="A+">A+</SelectItem>
                                    <SelectItem value="A-">A-</SelectItem>
                                    <SelectItem value="B+">B+</SelectItem>
                                    <SelectItem value="B-">B-</SelectItem>
                                    <SelectItem value="AB+">AB+</SelectItem>
                                    <SelectItem value="AB-">AB-</SelectItem>
                                    <SelectItem value="O+">O+</SelectItem>
                                    <SelectItem value="O-">O-</SelectItem>
                                    <SelectItem value="Prefer not to say">Prefer not to say</SelectItem>
                                </SelectContent>
                            </Select>
                            <p className="text-xs text-muted-foreground">This information is used only in case of emergencies during trips. It will never be shared publicly and is stored securely.</p>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="emergency-contact">Emergency Contact (General)</Label>
                            <Input id="emergency-contact" type="tel" defaultValue={user.emergencyContact} />
                        </div>
                    </div>
                </div>
            </TabsContent>

            <TabsContent value="address" className="pt-6">
                  <div className="grid gap-6">
                    <div className="space-y-2">
                        <Label htmlFor="street">Street Address</Label>
                        <Input id="street" defaultValue={user.address?.street} />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="city">City</Label>
                            <Input id="city" defaultValue={user.address?.city} />
                        </div>
                          <div className="space-y-2">
                            <Label htmlFor="pincode">Pincode</Label>
                            <Input id="pincode" defaultValue={user.address?.pincode} />
                        </div>
                    </div>
                </div>
            </TabsContent>

              <TabsContent value="preferences" className="pt-6">
                  <div className="grid gap-6">
                    <div className="space-y-2">
                        <Label htmlFor="interests">Interests</Label>
                          <Textarea id="interests" defaultValue={user.interests?.join(", ")} placeholder="e.g., Hiking, Food, Photography"/>
                          <p className="text-sm text-muted-foreground">Separate interests with a comma.</p>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="travel-style">Travel Style</Label>
                        <Select defaultValue={user.travelPreferences}>
                            <SelectTrigger id="travel-style">
                                <SelectValue placeholder="Select your travel style" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="Budget">Budget</SelectItem>
                                <SelectItem value="Mid-range">Mid-range</SelectItem>
                                <SelectItem value="Luxury">Luxury</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>
            </TabsContent>

            <TabsContent value="wallet" className="pt-6 space-y-6">
                <div className="grid gap-6 md:grid-cols-2">
                    <Card>
                        <CardHeader className="flex flex-row items-center gap-4 space-y-0">
                        <span className="text-3xl font-bold text-primary">₹</span>
                        <div>
                            <CardTitle>Travel Wallet</CardTitle>
                            <CardDescription>Your available credits.</CardDescription>
                        </div>
                        </CardHeader>
                        <CardContent>
                        <p className="text-3xl font-bold">
                            ₹{user.walletBalance.toLocaleString("en-IN")}
                        </p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center gap-4 space-y-0">
                        <Gift className="h-8 w-8 text-primary" />
                        <div>
                            <CardTitle>Referral Code</CardTitle>
                            <CardDescription>Share and earn credits.</CardDescription>
                        </div>
                        </CardHeader>
                        <CardContent className="flex items-center gap-4">
                        <Input
                            readOnly
                            value={user.referralCode}
                            className="font-mono text-lg"
                        />
                        <Button variant="outline">Copy</Button>
                        </CardContent>
                    </Card>
                </div>
                {/* DEV_COMMENT: START - Enhanced Wallet Transaction History Card */}
                <Card>
                    <CardHeader>
                        <CardTitle>Transaction History</CardTitle>
                        <CardDescription>A log of all your wallet credits and debits.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Date</TableHead>
                                    <TableHead>Description</TableHead>
                                    <TableHead>Source</TableHead>
                                    <TableHead className="text-right">Amount</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {walletLoading ? <WalletHistorySkeleton /> : (
                                    walletTransactions.length > 0 ? (
                                        walletTransactions.map((tx, idx) => (
                                            <TableRow key={tx.id ?? idx}>
                                                <TableCell className="text-muted-foreground"><ClientOnlyDate dateString={tx.date} type="date" /></TableCell>
                                                <TableCell className="font-medium">{tx.description}</TableCell>
                                                <TableCell><Badge variant="outline">{tx.source}</Badge></TableCell>
                                                <TableCell className={cn("text-right font-mono font-semibold", tx.type === 'Credit' ? 'text-green-600' : 'text-red-600')}>
                                                    <span className="inline-flex items-center gap-1">
                                                        {tx.type === 'Credit' ? <ArrowRight className="h-3 w-3" /> : <ArrowLeft className="h-3 w-3" />}
                                                        ₹{Math.abs(tx.amount).toLocaleString('en-IN')}
                                                    </span>
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    ) : (
                                        <TableRow>
                                            <TableCell colSpan={4} className="text-center h-24 text-muted-foreground">
                                                No transactions yet.
                                            </TableCell>
                                        </TableRow>
                                    )
                                )}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
                 {/* DEV_COMMENT: END - Enhanced Wallet Transaction History Card */}
            </TabsContent>

            <TabsContent value="security" className="pt-6">
                <div className="space-y-6">
                     <Card>
                        <CardHeader>
                            <CardTitle>Account Security</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex items-center text-sm text-muted-foreground p-4 bg-muted/50 rounded-lg">
                                <Shield className="mr-3 h-5 w-5"/>
                                <span>Your account is secured with a traditional email and password login.</span>
                            </div>
                             <div className="flex items-center justify-between rounded-lg border p-4">
                                <div>
                                    <h3 className="text-base font-medium">Marketing Emails</h3>
                                    <p className="text-sm text-muted-foreground">Receive updates on new trips and promotions.</p>
                                </div>
                                <Switch defaultChecked={user.marketingOptIn} />
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </TabsContent>
          </Tabs>
        </CardContent>
          <CardFooter className="border-t px-6 py-4">
            <Button onClick={handleSaveChanges} disabled={isSaving}>
                {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Save Changes
            </Button>
          </CardFooter>
      </Card>
    </main>
  );
}
