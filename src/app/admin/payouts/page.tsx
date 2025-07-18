/**
 * @fileoverview Admin Payouts Management Page
 * 
 * @description
 * This page allows Superadmins to view, manage, and process payout requests from Trip Organizers.
 * It's a critical component for financial management on the platform.
 * 
 * @developer_notes
 * - **State Management**: This is a client component (`"use client"`) that uses `useState` to manage the list of payouts. In a real application, this state would be fetched and managed via a library like React Query or SWR.
 * - **API Integration**:
 *   - **Fetch Payouts**: Data should be fetched from `GET /api/admin/payouts`. This API must join data from trips and organizers to display names and context.
 *   - **Process Payout**: The `ProcessPayoutDialog` should trigger `POST /api/admin/payouts/{payoutId}/process`. The payload would include `paymentMode`, `utrNumber`, `paidDate`, `notes`. The backend must update the payout record's status and generate/store an `invoiceUrl`.
 *   - **Invoice Generation API**:
 *     - **Endpoint**: `GET /api/invoices/:payoutId` (secured for admins).
 *     - **Action**: Triggers on-the-fly generation of a PDF invoice.
 *     - **PDF Content**: Should be generated from a styled HTML template and include:
 *       - **Company Header**: Travonex company details, GSTIN.
 *       - **Invoice Metadata**: Unique Invoice ID (e.g., `INV/2024/001`), Issue Date, Payout Status.
 *       - **Organizer Details**: Name, Business Name, PAN, GSTIN (fetched from Organizer profile).
 *       - **Trip & Earnings Breakdown**: Trip Title, Batch Dates, Gross Revenue, Platform Commission, Taxes (if any), and Net Payout Amount.
 *       - **Payment Details**: UTR, Payment Mode, Date Paid.
 *     - **Response**: The API should return the file with `Content-Type: application/pdf` and `Content-Disposition: attachment; filename="invoice_INV-2024-001.pdf"`.
 * - **Data Integrity & Calculations**: All financial calculations (total revenue, platform commission, net payout) must be performed and validated on the backend when the payout record is first generated to prevent client-side manipulation. The frontend should only display this verified data.
 * - **Audit Trail**: Every status change on a payout (e.g., from 'Pending' to 'Paid', or 'Paid' to 'Failed') must be logged in an audit trail table with the responsible admin's ID and a timestamp for accountability.
 */
"use client";

import * as React from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import type { Payout } from "@/lib/types";
import { DatePicker } from "@/components/ui/datepicker";
import { Textarea } from "@/components/ui/textarea";
import { Download, Briefcase, Calendar, Hash, Banknote, Landmark, ScanLine } from "lucide-react";
import { ClientOnlyDate } from "@/components/common/ClientOnlyDate";

// A dedicated component for the payout processing dialog to encapsulate its logic and state.
function ProcessPayoutDialog({ payout, onPayoutProcessed }: { payout: Payout, onPayoutProcessed: (payoutId: string, details: { paymentMode: string, utrNumber: string, paidDate?: Date, notes?: string }) => void }) {
    const { toast } = useToast();
    const [open, setOpen] = React.useState(false);
    const [paymentMode, setPaymentMode] = React.useState('');
    const [utrNumber, setUtrNumber] = React.useState('');
    const [paidDate, setPaidDate] = React.useState<Date | undefined>(new Date());
    const [notes, setNotes] = React.useState('');

    const handleProcessPayout = () => {
        // API Integration Point.
        // This should call `POST /api/admin/payouts/{payout.id}/process`.
        const payload = {
            payoutId: payout.id,
            paymentMode,
            utrNumber,
            paidDate,
            notes,
            status: 'Paid',
            invoiceUrl: `/invoices/${payout.id}.pdf`, // Backend should generate and save this
        };
        console.log("Process Payout Payload:", payload);
        
        onPayoutProcessed(payout.id, payload); // Simulate state update
        toast({ title: "Payout Processed", description: `Payout for has been marked as completed.` });
        setOpen(false); // Close the dialog
    };

    const organizer = (payout as any).organizer;

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button size="sm">Process Payout</Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Process Payout for {organizer?.name}</DialogTitle>
                    <DialogDescription>
                        Confirm payment details for the payout of ₹{payout.netPayout.toLocaleString('en-IN')}.
                    </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <div className="space-y-2">
                        <Label htmlFor="payment-mode">Payment Mode</Label>
                        <Select value={paymentMode} onValueChange={setPaymentMode}>
                            <SelectTrigger id="payment-mode"><SelectValue placeholder="Select payment mode" /></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="IMPS">IMPS</SelectItem>
                                <SelectItem value="NEFT">NEFT</SelectItem>
                                <SelectItem value="UPI">UPI</SelectItem>
                                <SelectItem value="Manual">Manual</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="utr">UTR / Reference Number</Label>
                        <Input id="utr" value={utrNumber} onChange={(e) => setUtrNumber(e.target.value)} />
                    </div>
                     <div className="space-y-2">
                        <Label htmlFor="transfer-date">Date of Transfer</Label>
                        <DatePicker date={paidDate} setDate={setPaidDate} />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="notes">Internal Notes (Optional)</Label>
                        <Textarea id="notes" value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="e.g., Follow up with organizer..." />
                    </div>
                </div>
                <DialogFooter>
                    <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
                    <Button type="submit" onClick={handleProcessPayout} disabled={!paymentMode || !utrNumber || !paidDate}>Mark as Paid</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}


// DEV_COMMENT: START - Payout Details Dialog Component
// This component provides a comprehensive, read-only view of a processed payout.
// It fetches related data (organizer, trip) to give the admin full context.
function PayoutDetailsDialog({ payout }: { payout: Payout }) {
    const [open, setOpen] = React.useState(false);
    
    // DEV_COMMENT: Fetch related data to display in the dialog.
    // In a real app, this data might be passed in directly or fetched via a dedicated API endpoint.
    const organizer = (payout as any).organizer;
    const trip = (payout as any).trip;
    const batch = trip?.batches?.find((b: any) => b.id === payout.batchId);
    
    const commissionPercentage = payout.totalRevenue > 0 ? ((payout.platformCommission / payout.totalRevenue) * 100).toFixed(1) : 0;

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="outline" size="sm">View Details</Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-2xl">
                <DialogHeader>
                    <DialogTitle>Payout Details for {organizer?.name}</DialogTitle>
                    <DialogDescription>Payout ID: {payout.id}</DialogDescription>
                </DialogHeader>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 py-4 max-h-[70vh] overflow-y-auto pr-4">
                    {/* Left Column: Payout & Earnings */}
                    <div className="space-y-6">
                        <Card>
                            <CardHeader><CardTitle className="text-base flex items-center gap-2"><Briefcase/> Payout Summary</CardTitle></CardHeader>
                            <CardContent className="text-sm space-y-3">
                                <div className="flex justify-between"><span>Trip:</span> <span className="font-medium text-right">{trip?.title}</span></div>
                                <div className="flex justify-between"><span>Batch Dates:</span> <span className="font-medium text-right">{batch ? <><ClientOnlyDate dateString={batch.startDate} type="date" /> - <ClientOnlyDate dateString={batch.endDate} type="date" /></> : 'N/A'}</span></div>
                                <div className="flex justify-between"><span>Request Date:</span> <span className="font-medium text-right"><ClientOnlyDate dateString={payout.requestDate} type="date" /></span></div>
                                <div className="flex justify-between"><span>Trip Completion:</span> <span className="font-medium text-right">{batch ? <ClientOnlyDate dateString={batch.endDate} type="date" /> : 'N/A'}</span></div>
                            </CardContent>
                        </Card>
                        
                        <Card>
                            <CardHeader><CardTitle className="text-base flex items-center gap-2"><span className="font-sans">₹</span> Earnings Breakdown</CardTitle></CardHeader>
                            <CardContent className="text-sm space-y-3">
                                <div className="flex justify-between"><span>Total Booking Revenue:</span> <span>₹{payout.totalRevenue.toLocaleString('en-IN')}</span></div>
                                <div className="flex justify-between text-muted-foreground"><span>Platform Commission ({commissionPercentage}%):</span> <span>- ₹{payout.platformCommission.toLocaleString('en-IN')}</span></div>
                                <div className="flex justify-between font-bold text-lg border-t pt-2 mt-2"><span>Net Payout Amount:</span> <span>₹{payout.netPayout.toLocaleString('en-IN')}</span></div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Right Column: Payment & Organizer Financials */}
                    <div className="space-y-6">
                        <Card>
                            <CardHeader><CardTitle className="text-base flex items-center gap-2"><Banknote/> Payment Details</CardTitle></CardHeader>
                            <CardContent className="text-sm space-y-3">
                                <div className="flex justify-between"><span>Mode of Transfer:</span> <Badge variant="secondary">{payout.paymentMode || 'N/A'}</Badge></div>
                                <div className="flex justify-between"><span>Date Transferred:</span> <span className="font-medium">{payout.paidDate ? <ClientOnlyDate dateString={payout.paidDate as string} type="date" /> : 'N/A'}</span></div>
                                <div className="flex justify-between"><span>UTR / Reference:</span> <span className="font-mono text-xs">{payout.utrNumber || 'N/A'}</span></div>
                                <div className="flex justify-between"><span>Status:</span> <Badge className={payout.status === 'Paid' ? 'bg-green-600' : 'bg-gray-500'}>{payout.status}</Badge></div>
                                {payout.invoiceUrl && (
                                     <Button className="w-full mt-2" variant="outline" asChild>
                                        <a href={payout.invoiceUrl} download>
                                            <Download className="mr-2 h-4 w-4"/> Download Invoice
                                        </a>
                                    </Button>
                                )}
                            </CardContent>
                        </Card>

                        {organizer && (
                           <Card>
                                <CardHeader><CardTitle className="text-base flex items-center gap-2"><Landmark/> Organizer Financials</CardTitle></CardHeader>
                                <CardContent className="text-sm space-y-3 font-mono">
                                    <div className="flex justify-between"><span>A/C Holder:</span> <span className="font-sans font-medium">{organizer.name}</span></div>
                                    <div className="flex justify-between"><span>A/C Number:</span> <span>{organizer.bankAccountNumber || 'N/A'}</span></div>
                                    <div className="flex justify-between"><span>IFSC Code:</span> <span>{organizer.ifscCode || 'N/A'}</span></div>
                                    <div className="flex justify-between"><span>PAN:</span> <span>{organizer.pan || 'N/A'}</span></div>
                                </CardContent>
                            </Card>
                        )}
                    </div>
                </div>

                {payout.notes && (
                    <div className="border-t pt-4">
                        <Label>Admin Notes</Label>
                        <p className="text-sm text-muted-foreground p-3 bg-muted/50 rounded-lg">{payout.notes}</p>
                    </div>
                )}
                
                <DialogFooter className="pt-4 border-t">
                    <Button type="button" variant="outline" onClick={() => setOpen(false)}>Close</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
// DEV_COMMENT: END - Payout Details Dialog Component


export default function AdminPayoutsPage() {
    const [payouts, setPayouts] = React.useState<Payout[]>([]);

    useEffect(() => {
        fetch('/api/admin/payouts')
            .then(res => res.json())
            .then(setPayouts)
            .catch(() => setPayouts([]));
    }, []);

    const handlePayoutProcessed = (payoutId: string, details: any) => {
        // This simulates the state update after a successful API call.
        setPayouts(currentPayouts =>
            currentPayouts.map(p => 
                p.id === payoutId 
                ? { ...p, status: 'Paid', ...details } 
                : p
            )
        );
    };

    const getStatusBadge = (status: Payout['status']) => {
        switch (status) {
            case 'Paid': return 'bg-green-600';
            case 'Pending': return 'bg-amber-500';
            default: return 'bg-gray-500';
        }
    }

    return (
        <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
            <div className="space-y-2">
                <h1 className="text-3xl md:text-4xl font-headline font-bold tracking-tight">Vendor Payouts</h1>
                <p className="text-lg text-muted-foreground">Manage and track payouts to vendors.</p>
            </div>
            <Card>
                <CardHeader>
                    <CardTitle>Payout Requests</CardTitle>
                    <CardDescription>A list of pending and completed payout requests from vendors.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Vendor</TableHead>
                                <TableHead>Trip / Batch</TableHead>
                                <TableHead>Request Date</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead className="text-right">Amount</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {payouts.map((payout) => {
                                const organizer = (payout as any).organizer;
                                const trip = (payout as any).trip;
                                const batch = trip?.batches?.find((b: any) => b.id === payout.batchId);
                                return (
                                    <TableRow key={payout.id}>
                                        <TableCell className="font-medium">{organizer?.name || 'N/A'}</TableCell>
                                        <TableCell>
                                            <div className="font-medium">{trip?.title || 'N/A'}</div>
                                            {batch && <div className="text-xs text-muted-foreground"><ClientOnlyDate dateString={batch.startDate} type="date" /></div>}
                                        </TableCell>
                                        <TableCell><ClientOnlyDate dateString={payout.requestDate} type="date" /></TableCell>
                                        <TableCell>
                                            <Badge variant={'default'} className={getStatusBadge(payout.status)}>{payout.status}</Badge>
                                        </TableCell>
                                        <TableCell className="text-right font-mono">₹{payout.netPayout.toLocaleString('en-IN')}</TableCell>
                                        <TableCell className="text-right space-x-2">
                                            {payout.status === 'Pending' ? (
                                                <ProcessPayoutDialog payout={payout} onPayoutProcessed={handlePayoutProcessed} />
                                            ) : (
                                                <>
                                                    <PayoutDetailsDialog payout={payout} />
                                                    <Button variant="outline" size="icon" asChild>
                                                        <a href={payout.invoiceUrl || '#'} download>
                                                            <Download className="h-4 w-4" />
                                                            <span className="sr-only">Download Invoice</span>
                                                        </a>
                                                    </Button>
                                                </>
                                            )}
                                        </TableCell>
                                    </TableRow>
                                )
                            })}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </main>
    );
}
