
/**
 * @fileoverview Admin Users Management Page
 * 
 * @description
 * This page allows Superadmins to view and manage all registered users on the platform.
 * It is now a client component to handle the state for viewing and editing user details.
 * 
 * @developer_notes
 * - **State Management**: Uses `useState` and `react-hook-form` to manage the selected user for both view and edit dialogs. The logic to reset the form on opening the edit dialog is crucial for preventing data contamination between different users.
 * - **API Integration**:
 *   - Fetch Users: `GET /api/admin/access/users`.
 *   - User Details: The dialogs fetch detailed data from `GET /api/admin/access/users/{userId}`.
 *   - Update User: The "Edit" dialog triggers `PUT /api/admin/access/users/{userId}` with the form data.
 *   - Admin actions (like updating a profile) should be logged in the audit trail.
 */
"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useEffect } from "react";
import type { User, Booking, WalletTransaction } from "@/lib/types";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DatePicker } from "@/components/ui/datepicker";
import { useToast } from "@/hooks/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";
import { ArrowRight, ArrowLeft, AlertTriangle, Wallet } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";


// DEV_COMMENT: Schema for validating the admin's user edit form.
const UserFormSchema = z.object({
  name: z.string().min(3, "Name is required."),
  email: z.string().email("Invalid email address."),
  phone: z.string().min(10, "Invalid phone number."),
  status: z.enum(['Active', 'Suspended']),
  walletBalance: z.coerce.number().min(0),
  gender: z.string().optional(),
  bloodGroup: z.string().optional(),
  dateOfBirth: z.date().optional(),
  address: z.object({
      street: z.string().optional(),
      city: z.string().optional(),
      pincode: z.string().optional(),
  }).optional(),
  emergencyContact: z.string().optional(),
  interests: z.string().optional(),
  travelPreferences: z.string().optional(),
  marketingOptIn: z.boolean().optional(),
});
type UserFormData = z.infer<typeof UserFormSchema>;


// DEV_COMMENT: Schema for the wallet adjustment form.
const AdjustWalletSchema = z.object({
    amount: z.coerce.number().int().min(1, "Amount must be greater than 0."),
    reason: z.string().min(10, "A detailed reason is required (min 10 characters)."),
    type: z.enum(['Credit', 'Debit']),
});
type AdjustWalletData = z.infer<typeof AdjustWalletSchema>;


// DEV_COMMENT: A dedicated dialog to adjust a user's wallet.
function AdjustWalletDialog({ user, onSave, isOpen, onOpenChange }: { user: User; onSave: (data: AdjustWalletData) => void, isOpen: boolean, onOpenChange: (open: boolean) => void }) {
    const { toast } = useToast();
    const form = useForm<AdjustWalletData>({
        resolver: zodResolver(AdjustWalletSchema),
        defaultValues: { type: 'Credit', amount: 0, reason: '' },
    });
    
    const onSubmit = (data: AdjustWalletData) => {
        onSave(data);
        onOpenChange(false);
        form.reset();
        toast({ title: "Wallet Updated", description: `₹${data.amount} has been ${data.type === 'Credit' ? 'credited to' : 'debited from'} ${user.name}'s wallet.`});
    };
    
    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Adjust Wallet for {user.name}</DialogTitle>
                    <DialogDescription>Manually credit or debit the user's wallet. This action will be logged.</DialogDescription>
                </DialogHeader>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
                        <div className="grid grid-cols-2 gap-4">
                            <FormField control={form.control} name="amount" render={({ field }) => (<FormItem><FormLabel>Amount (₹)</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>)} />
                            <FormField control={form.control} name="type" render={({ field }) => (<FormItem><FormLabel>Action</FormLabel><Select onValueChange={field.onChange} defaultValue={field.value}><FormControl><SelectTrigger><SelectValue/></SelectTrigger></FormControl><SelectContent><SelectItem value="Credit">Credit (Add)</SelectItem><SelectItem value="Debit">Debit (Remove)</SelectItem></SelectContent></Select><FormMessage /></FormItem>)} />
                        </div>
                        <FormField control={form.control} name="reason" render={({ field }) => (<FormItem><FormLabel>Reason</FormLabel><FormControl><Textarea {...field} placeholder="e.g., Goodwill gesture for service issue."/></FormControl><FormMessage /></FormItem>)} />
                        <DialogFooter className="pt-4">
                            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
                            <Button type="submit">Confirm Adjustment</Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}

// DEV_COMMENT: A dedicated dialog to show comprehensive user information.
function UserDetailsDialog({ user, onAdjustWalletClick, isOpen, onOpenChange }: { user: User | null, onAdjustWalletClick: () => void, isOpen: boolean, onOpenChange: (open: boolean) => void }) {
    if (!user) return null;

    const userBookings = (user as any).bookings || [];

    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-3xl">
                <DialogHeader>
                    <div className="flex items-center gap-4">
                        <Avatar className="h-16 w-16">
                            <AvatarImage src={user.avatar} alt={user.name} data-ai-hint="person avatar" />
                            <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div>
                            <DialogTitle className="text-2xl">{user.name}</DialogTitle>
                            <DialogDescription>
                                {user.email} | {user.phone} | Joined: {user.joinDate}
                            </DialogDescription>
                        </div>
                    </div>
                </DialogHeader>
                 <div className="py-4 max-h-[60vh] overflow-y-auto pr-4">
                    <Tabs defaultValue="profile">
                        <TabsList className="grid w-full grid-cols-4">
                            <TabsTrigger value="profile">Profile</TabsTrigger>
                            <TabsTrigger value="bookings">Bookings ({userBookings.length})</TabsTrigger>
                            <TabsTrigger value="wallet">Wallet</TabsTrigger>
                            <TabsTrigger value="preferences">Preferences</TabsTrigger>
                        </TabsList>
                        <TabsContent value="profile" className="pt-4">
                            <Card>
                                <CardContent className="pt-6 grid grid-cols-2 gap-4 text-sm">
                                    <div><span className="text-muted-foreground">Gender:</span> {user.gender || 'N/A'}</div>
                                    <div><span className="text-muted-foreground">DOB:</span> {user.dateOfBirth ? new Date(user.dateOfBirth).toLocaleDateString() : 'N/A'}</div>
                                    <div className="font-medium"><span className="text-muted-foreground">Blood Group:</span> {user.bloodGroup || 'Not Provided'}</div>
                                    <div><span className="text-muted-foreground">Emergency Contact:</span> {user.emergencyContact || 'N/A'}</div>
                                    <div className="col-span-2"><span className="text-muted-foreground">Address:</span> {`${user.address?.street || ''}, ${user.address?.city || ''} - ${user.address?.pincode || ''}`}</div>
                                </CardContent>
                            </Card>
                        </TabsContent>
                        <TabsContent value="bookings" className="pt-4">
                             <Card>
                                <CardHeader><CardTitle className="text-base">Booking History</CardTitle></CardHeader>
                                <CardContent>
                                    <Table>
                                        <TableHeader><TableRow><TableHead>Trip</TableHead><TableHead>Status</TableHead><TableHead className="text-right">Amount</TableHead></TableRow></TableHeader>
                                        <TableBody>
                                            {userBookings.map(booking => {
                                                const trip = (booking as any).trip;
                                                return (
                                                    <TableRow key={booking.id}>
                                                        <TableCell>{trip?.title}</TableCell>
                                                        <TableCell><Badge>{booking.status}</Badge></TableCell>
                                                        <TableCell className="text-right font-mono">₹{booking.amount.toLocaleString('en-IN')}</TableCell>
                                                    </TableRow>
                                                )
                                            })}
                                            {userBookings.length === 0 && <TableRow><TableCell colSpan={3} className="text-center h-24">No bookings found.</TableCell></TableRow>}
                                        </TableBody>
                                    </Table>
                                </CardContent>
                            </Card>
                        </TabsContent>
                        <TabsContent value="wallet" className="pt-4">
                            <Card>
                                 <CardHeader className="flex-row items-center justify-between">
                                    <CardTitle className="text-base">Wallet Details</CardTitle>
                                    <Button variant="outline" size="sm" onClick={onAdjustWalletClick}><Wallet className="mr-2"/> Adjust Wallet</Button>
                                 </CardHeader>
                                 <CardContent>
                                     <div className="grid grid-cols-2 gap-4 mb-4">
                                        <div className="space-y-1"><p className="text-sm text-muted-foreground">Wallet Balance</p><p className="font-bold text-lg font-mono">₹{user.walletBalance.toLocaleString('en-IN')}</p></div>
                                        <div className="space-y-1"><p className="text-sm text-muted-foreground">Referral Code</p><p className="font-bold text-lg font-mono">{user.referralCode}</p></div>
                                    </div>
                                    <h4 className="font-medium text-sm mb-2">Transaction History</h4>
                                    <Table>
                                        <TableHeader><TableRow><TableHead>Date</TableHead><TableHead>Description</TableHead><TableHead className="text-right">Amount</TableHead></TableRow></TableHeader>
                                        <TableBody>
                                            {user.walletTransactions?.map(tx => (
                                                <TableRow key={tx.id}>
                                                    <TableCell className="text-xs">{new Date(tx.date).toLocaleDateString()}</TableCell>
                                                    <TableCell>{tx.description}</TableCell>
                                                    <TableCell className={cn("text-right font-mono", tx.type === 'Credit' ? 'text-green-600' : 'text-red-600')}>
                                                        {tx.type === 'Credit' ? '+' : '-'} ₹{Math.abs(tx.amount).toLocaleString('en-IN')}
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                             {(!user.walletTransactions || user.walletTransactions.length === 0) && <TableRow><TableCell colSpan={3} className="text-center h-24">No transactions found.</TableCell></TableRow>}
                                        </TableBody>
                                    </Table>
                                 </CardContent>
                            </Card>
                        </TabsContent>
                         <TabsContent value="preferences" className="pt-4">
                            <Card>
                                <CardContent className="pt-6 grid grid-cols-1 gap-4 text-sm">
                                    <div><span className="text-muted-foreground">Interests:</span> {user.interests?.join(', ') || 'N/A'}</div>
                                    <div><span className="text-muted-foreground">Travel Style:</span> {user.travelPreferences || 'N/A'}</div>
                                    <div><span className="text-muted-foreground">Marketing Emails:</span> {user.marketingOptIn ? 'Opted-in' : 'Opted-out'}</div>
                                </CardContent>
                            </Card>
                        </TabsContent>
                    </Tabs>
                 </div>
                 <DialogFooter>
                    <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Close</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

// DEV_COMMENT: A dedicated dialog to edit user details from the admin panel.
function EditUserDialog({ user, isOpen, onOpenChange, onSave }: { user: User | null, isOpen: boolean, onOpenChange: (open: boolean) => void, onSave: (data: UserFormData) => void }) {
    const form = useForm<UserFormData>({
        resolver: zodResolver(UserFormSchema),
    });

    // DEV_COMMENT: This useEffect hook is CRITICAL for data integrity. It ensures the form
    // is reset with the correct user's data every time the dialog is opened. Without this,
    // data from a previously edited user could persist and be accidentally saved for a different user.
    React.useEffect(() => {
        if (user && isOpen) {
            form.reset({
                name: user.name,
                email: user.email,
                phone: user.phone,
                status: user.status,
                walletBalance: user.walletBalance,
                gender: user.gender,
                bloodGroup: user.bloodGroup,
                dateOfBirth: user.dateOfBirth ? new Date(user.dateOfBirth) : undefined,
                address: user.address,
                emergencyContact: user.emergencyContact,
                interests: user.interests?.join(', '),
                travelPreferences: user.travelPreferences,
                marketingOptIn: user.marketingOptIn,
            });
        }
    }, [user, form, isOpen]); 

    if (!user) {
        return null;
    }

    const onSubmit = (data: UserFormData) => {
        onSave(data);
        onOpenChange(false);
    }
    
    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-3xl">
                <DialogHeader><DialogTitle>Edit User: {user.name}</DialogTitle><DialogDescription>Modify user details below. Changes will be logged.</DialogDescription></DialogHeader>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4 max-h-[70vh] overflow-y-auto pr-4">
                        <Tabs defaultValue="account">
                            <TabsList className="grid w-full grid-cols-2">
                                <TabsTrigger value="account">Account &amp; Profile</TabsTrigger>
                                <TabsTrigger value="advanced">Advanced</TabsTrigger>
                            </TabsList>
                            <TabsContent value="account" className="pt-4 space-y-4">
                                <Alert variant="default">
                                    <AlertTriangle className="h-4 w-4" />
                                    <AlertTitle>Admin Action Required</AlertTitle>
                                    <AlertDescription>
                                        Per business rules, please do not modify the user's name, email, or phone without explicit verification and a support ticket.
                                    </AlertDescription>
                                </Alert>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <FormField control={form.control} name="name" render={({ field }) => (<FormItem><FormLabel>Full Name</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
                                    <FormField control={form.control} name="email" render={({ field }) => (<FormItem><FormLabel>Email</FormLabel><FormControl><Input type="email" {...field} /></FormControl><FormMessage /></FormItem>)} />
                                    <FormField control={form.control} name="phone" render={({ field }) => (<FormItem><FormLabel>Phone</FormLabel><FormControl><Input type="tel" {...field} /></FormControl><FormMessage /></FormItem>)} />
                                     <FormField control={form.control} name="gender" render={({ field }) => (<FormItem><FormLabel>Gender</FormLabel><Select onValueChange={field.onChange} defaultValue={field.value}><FormControl><SelectTrigger><SelectValue/></SelectTrigger></FormControl><SelectContent><SelectItem value="Male">Male</SelectItem><SelectItem value="Female">Female</SelectItem><SelectItem value="Non-binary">Non-binary</SelectItem></SelectContent></Select><FormMessage /></FormItem>)} />
                                    <FormField control={form.control} name="dateOfBirth" render={({ field }) => (<FormItem className="flex flex-col"><FormLabel>Date of Birth</FormLabel><DatePicker date={field.value} setDate={field.onChange} /><FormMessage /></FormItem>)} />
                                    <FormField control={form.control} name="bloodGroup" render={({ field }) => (<FormItem><FormLabel>Blood Group</FormLabel><Select onValueChange={field.onChange} defaultValue={field.value}><FormControl><SelectTrigger><SelectValue placeholder="Select blood group" /></SelectTrigger></FormControl><SelectContent><SelectItem value="A+">A+</SelectItem><SelectItem value="A-">A-</SelectItem><SelectItem value="B+">B+</SelectItem><SelectItem value="B-">B-</SelectItem><SelectItem value="AB+">AB+</SelectItem><SelectItem value="AB-">AB-</SelectItem><SelectItem value="O+">O+</SelectItem><SelectItem value="O-">O-</SelectItem><SelectItem value="Prefer not to say">Prefer not to say</SelectItem></SelectContent></Select><FormMessage /></FormItem>)} />
                                </div>
                                <div>
                                     <FormField control={form.control} name="address.street" render={({ field }) => (<FormItem><FormLabel>Address</FormLabel><FormControl><Input {...field} placeholder="Street" /></FormControl><FormMessage /></FormItem>)} />
                                     <div className="grid grid-cols-2 gap-4 mt-2">
                                         <FormField control={form.control} name="address.city" render={({ field }) => (<FormControl><Input {...field} placeholder="City" /></FormControl>)} />
                                         <FormField control={form.control} name="address.pincode" render={({ field }) => (<FormControl><Input {...field} placeholder="Pincode" /></FormControl>)} />
                                     </div>
                                </div>
                                <FormField control={form.control} name="emergencyContact" render={({ field }) => (<FormItem><FormLabel>Emergency Contact</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
                            </TabsContent>
                             <TabsContent value="advanced" className="pt-4 space-y-4">
                                <FormField control={form.control} name="status" render={({ field }) => (<FormItem><FormLabel>Account Status</FormLabel><Select onValueChange={field.onChange} defaultValue={field.value}><FormControl><SelectTrigger><SelectValue/></SelectTrigger></FormControl><SelectContent><SelectItem value="Active">Active</SelectItem><SelectItem value="Suspended">Suspended</SelectItem></SelectContent></Select><FormMessage /></FormItem>)} />
                                <FormField control={form.control} name="walletBalance" render={({ field }) => (<FormItem><FormLabel>Wallet Balance (₹)</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>)} />
                                <FormField control={form.control} name="interests" render={({ field }) => (<FormItem><FormLabel>Interests</FormLabel><FormControl><Textarea {...field} placeholder="Comma-separated interests..."/></FormControl><FormMessage /></FormItem>)} />
                                 <FormField control={form.control} name="marketingOptIn" render={({ field }) => (<FormItem className="flex flex-row items-center justify-between rounded-lg border p-3"><FormLabel>Marketing Emails Opt-in</FormLabel><FormControl><Switch checked={field.value} onCheckedChange={field.onChange} /></FormControl></FormItem>)} />
                            </TabsContent>
                        </Tabs>
                        <DialogFooter className="pt-4 border-t">
                            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
                            <Button type="submit">Save Changes</Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}

export default function AdminUsersPage() {
  const { toast } = useToast();
  const [users, setUsers] = React.useState<User[]>([]);

  useEffect(() => {
    fetch('/api/admin/access/users')
      .then(res => res.json())
      .then(setUsers)
      .catch(() => setUsers([]));
  }, []);
  const [isViewOpen, setIsViewOpen] = React.useState(false);
  const [isEditOpen, setIsEditOpen] = React.useState(false);
  const [isWalletOpen, setIsWalletOpen] = React.useState(false);
  const [selectedUser, setSelectedUser] = React.useState<User | null>(null);

  const handleViewDetails = (user: User) => {
    setSelectedUser(user);
    setIsViewOpen(true);
  };

  const handleEdit = (user: User) => {
    setSelectedUser(user);
    setIsEditOpen(true);
  }
  
  const handleAdjustWallet = () => {
    setIsViewOpen(false); // Close the details view
    setIsWalletOpen(true); // Open the wallet adjustment view
  };
  
  const handleSaveWallet = (data: AdjustWalletData) => {
    if (!selectedUser) return;
    
    // BACKEND: Call a dedicated API: PATCH /api/admin/access/users/{userId}/wallet
    const amount = data.type === 'Credit' ? data.amount : -data.amount;
    const newTransaction: WalletTransaction = {
        id: `txn_${Date.now()}`,
        date: new Date().toISOString(),
        description: `Admin Adjustment: ${data.reason}`,
        amount: amount,
        type: data.type,
        source: 'Admin Adjustment',
    };

    setUsers(users.map(u => 
        u.id === selectedUser.id ? { 
            ...u, 
            walletBalance: u.walletBalance + amount,
            walletTransactions: [newTransaction, ...(u.walletTransactions || [])]
        } : u
    ));
    
  }

  const handleSaveUser = (data: UserFormData) => {
    // BACKEND: Call PUT /api/admin/access/users/{selectedUser.id}
    // The backend should log this action in the audit trail.
    if (!selectedUser) return;
    
    // Simulate updating the user list
    setUsers(users.map(u =>
        u.id === selectedUser.id ? ({ ...u, ...data, interests: data.interests?.split(',').map(s => s.trim()) } as User) : u
    ));
    
    // BACKEND: Add a log to the audit trail here

    toast({
        title: "User Updated",
        description: `Profile for ${data.name} has been successfully updated.`
    });
  }

  return (
    <>
      <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
        <div className="space-y-2">
          <h1 className="text-3xl md:text-4xl font-headline font-bold tracking-tight">
            User Management
          </h1>
          <p className="text-lg text-muted-foreground">
            View and manage all users on the platform.
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>All Users</CardTitle>
            <CardDescription>A list of all registered users.</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Join Date</TableHead>
                  <TableHead>Wallet Balance</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.length > 0 ? users.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell className="flex items-center gap-4">
                      <Avatar>
                        <AvatarImage src={user.avatar} data-ai-hint="person avatar" />
                        <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-medium">{user.name}</div>
                        <div className="text-sm text-muted-foreground">{user.email}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={user.status === 'Active' ? 'secondary' : 'destructive'}>{user.status}</Badge>
                    </TableCell>
                    <TableCell>{user.joinDate}</TableCell>
                    <TableCell className="font-mono">
                      ₹{user.walletBalance.toLocaleString('en-IN')}
                    </TableCell>
                    <TableCell className="text-right space-x-2">
                      <Button variant="outline" size="sm" onClick={() => handleEdit(user)}>Edit</Button>
                      <Button variant="ghost" size="sm" onClick={() => handleViewDetails(user)}>View Details</Button>
                    </TableCell>
                  </TableRow>
                )) : (
                    <TableRow>
                        <TableCell colSpan={5} className="h-24 text-center">
                            No users found.
                        </TableCell>
                    </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </main>
      <UserDetailsDialog user={selectedUser} onAdjustWalletClick={handleAdjustWallet} isOpen={isViewOpen} onOpenChange={setIsViewOpen} />
      <EditUserDialog user={selectedUser} isOpen={isEditOpen} onOpenChange={setIsEditOpen} onSave={handleSaveUser} />
      {selectedUser && <AdjustWalletDialog user={selectedUser} isOpen={isWalletOpen} onOpenChange={setIsWalletOpen} onSave={handleSaveWallet} />}
    </>
  );
}
