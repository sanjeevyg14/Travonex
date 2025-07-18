

"use client";

import * as React from "react";
import Link from 'next/link';
import { useParams, notFound } from "next/navigation";
import { useEffect } from "react";
import type { Organizer, OrganizerDocument, Trip, UserSession } from "@/lib/types";
import { useToast } from "@/hooks/use-toast";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ArrowLeft, CheckCircle, FileText, Download, ShieldCheck, ShieldAlert, ShieldX, XCircle, Ban, RefreshCw, Eye, Loader2 } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ClientOnlyDate } from "@/components/common/ClientOnlyDate";
import { useAuth } from "@/context/AuthContext";

const getKycStatusBadgeColor = (status: Organizer['kycStatus']) => {
    switch(status) {
        case 'Verified': return 'bg-green-600';
        case 'Pending': return 'bg-amber-500';
        case 'Rejected': return 'bg-red-600';
        case 'Suspended': return 'bg-slate-700';
        default: return 'bg-gray-500';
    }
}

const getDocStatusBadgeColor = (status: OrganizerDocument['status']) => {
    switch(status) {
        case 'Verified': return 'bg-green-600';
        case 'Uploaded': return 'bg-blue-500';
        case 'Rejected': return 'bg-red-600';
        default: return 'bg-gray-500';
    }
}

// DEV_COMMENT: A simple dialog to preview a document. In a real app, this would load a PDF or image.
function DocumentPreviewDialog({ doc, isOpen, onOpenChange }: { doc: OrganizerDocument | null; isOpen: boolean; onOpenChange: (open: boolean) => void }) {
    if (!doc) return null;
    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-2xl">
                <DialogHeader>
                    <DialogTitle>{doc.docTitle}</DialogTitle>
                    <DialogDescription>
                        Previewing document. In a real app, this would be an embedded PDF/image viewer.
                    </DialogDescription>
                </DialogHeader>
                <div className="py-4">
                    <iframe src={doc.fileUrl} className="w-full h-96 border rounded-md" title={doc.docTitle}></iframe>
                </div>
            </DialogContent>
        </Dialog>
    );
}

export default function OrganizerProfilePage() {
    const params = useParams<{ organizerId: string }>();
    const { organizerId } = params;
    const { token } = useAuth();
    const { toast } = useToast();
    const [organizer, setOrganizer] = React.useState<Organizer | null>(null);
    const [organizerTrips, setOrganizerTrips] = React.useState<Trip[]>([]);
    const [totalBookings, setTotalBookings] = React.useState(0);
    const [totalRevenue, setTotalRevenue] = React.useState(0);
    const [isDocPreviewOpen, setIsDocPreviewOpen] = React.useState(false);
    const [selectedDoc, setSelectedDoc] = React.useState<OrganizerDocument | null>(null);
    const [isSaving, setIsSaving] = React.useState(false);

    if (!organizer) {
        return <div className="p-4">Loading...</div>;
    }


    useEffect(() => {
        fetch(`/api/admin/organizers/${organizerId}`)
            .then(res => res.json())
            .then(data => {
                setOrganizer(data.organizer);
                setOrganizerTrips(data.trips || []);
                setTotalBookings(data.totalBookings || 0);
                setTotalRevenue(data.totalRevenue || 0);
            })
            .catch(() => {
                setOrganizer(null);
                setOrganizerTrips([]);
                setTotalBookings(0);
                setTotalRevenue(0);
            });
    }, [organizerId]);

    const handleDocStatusChange = (docType: string, status: 'Verified' | 'Rejected') => {
        // BACKEND: Call `PATCH /api/admin/organizers/{organizerId}/documents/{docType}` with { status }
        setOrganizer(prev => ({
            ...prev,
            documents: prev.documents.map(doc => doc.docType === docType ? { ...doc, status } : doc)
        }));
        toast({ title: "Document Status Updated", description: `The document has been marked as ${status}.` });
    };
    
    const handleMainStatusChange = async (status: Organizer['kycStatus']) => {
        if (!token) {
            toast({ variant: 'destructive', title: "Authentication Error", description: "Your session has expired. Please log in again."});
            return;
        }
        setIsSaving(true);
        try {
            const response = await fetch(`/api/admin/organizers/${organizer.id}/status`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ kycStatus: status }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to update status.');
            }
            
            setOrganizer(prev => ({...prev, kycStatus: status}));
            toast({ title: `Organizer ${status}`, description: `${organizer.name}'s profile has been updated.` });

        } catch (error: any) {
             toast({ variant: 'destructive', title: "Update Failed", description: error.message });
        } finally {
            setIsSaving(false);
        }
    };

    const handlePreviewDoc = (doc: OrganizerDocument) => {
        setSelectedDoc(doc);
        setIsDocPreviewOpen(true);
    };

    return (
        <>
        <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
            <Link href="/admin/trip-organisers" className="flex items-center gap-2 text-sm text-muted-foreground hover:underline">
                <ArrowLeft className="h-4 w-4" />
                Back to All Organizers
            </Link>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
                <div className="lg:col-span-2 space-y-8">
                    <Card>
                        <CardHeader>
                            <div className="flex justify-between items-start">
                                <div>
                                    <CardTitle className="text-2xl">{organizer.name}</CardTitle>
                                    <CardDescription>ID: {organizer.id} &bull; Joined: <ClientOnlyDate dateString={organizer.joinDate} type="date" /></CardDescription>
                                </div>
                                <Badge className={getKycStatusBadgeColor(organizer.kycStatus)}>{organizer.kycStatus}</Badge>
                            </div>
                        </CardHeader>
                        <CardContent className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center border-t pt-6">
                            <div className="space-y-1"><p className="text-sm text-muted-foreground">Total Revenue</p><p className="font-bold text-lg">₹{totalRevenue.toLocaleString()}</p></div>
                            <div className="space-y-1"><p className="text-sm text-muted-foreground">Total Bookings</p><p className="font-bold text-lg">{totalBookings}</p></div>
                            <div className="space-y-1"><p className="text-sm text-muted-foreground">Total Trips</p><p className="font-bold text-lg">{organizerTrips.length}</p></div>
                            <div className="space-y-1"><p className="text-sm text-muted-foreground">Avg. Rating</p><p className="font-bold text-lg">4.5</p></div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader><CardTitle>KYC Documents & Verification</CardTitle></CardHeader>
                        <CardContent>
                             <Table>
                                <TableHeader>
                                    <TableRow><TableHead>Document Type</TableHead><TableHead>Status</TableHead><TableHead className="text-right">Actions</TableHead></TableRow>
                                </TableHeader>
                                <TableBody>
                                    {organizer.documents.map(doc => (
                                        <TableRow key={doc.docType}>
                                            <TableCell className="font-medium">{doc.docTitle}</TableCell>
                                            <TableCell><Badge className={getDocStatusBadgeColor(doc.status)}>{doc.status}</Badge></TableCell>
                                            <TableCell className="text-right space-x-2">
                                                <Button variant="outline" size="sm" onClick={() => handlePreviewDoc(doc)} disabled={!doc.fileUrl}>
                                                    <Eye className="mr-2 h-4 w-4"/>View
                                                </Button>
                                                <Button variant="ghost" size="icon" className="text-green-600 hover:bg-green-100" onClick={() => handleDocStatusChange(doc.docType, 'Verified')}><CheckCircle className="h-4 w-4"/></Button>
                                                <Button variant="ghost" size="icon" className="text-red-600 hover:bg-red-100" onClick={() => handleDocStatusChange(doc.docType, 'Rejected')}><XCircle className="h-4 w-4"/></Button>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>

                     <Card>
                        <CardHeader><CardTitle>Trips by {organizer.name}</CardTitle></CardHeader>
                        <CardContent>
                           <Table>
                               <TableHeader>
                                   <TableRow><TableHead>Trip Title</TableHead><TableHead>Status</TableHead><TableHead className="text-right">Actions</TableHead></TableRow>
                               </TableHeader>
                               <TableBody>
                                   {organizerTrips.map(trip => (
                                       <TableRow key={trip.id}>
                                           <TableCell className="font-medium">{trip.title}</TableCell>
                                           <TableCell><Badge>{trip.status}</Badge></TableCell>
                                           <TableCell className="text-right"><Button variant="outline" size="sm" asChild><Link href={`/admin/trips/${trip.id}`}>View/Edit</Link></Button></TableCell>
                                       </TableRow>
                                   ))}
                               </TableBody>
                           </Table>
                        </CardContent>
                    </Card>
                </div>

                <div className="lg:col-span-1 space-y-8 sticky top-24">
                     <Card>
                        <CardHeader><CardTitle>Admin Actions</CardTitle></CardHeader>
                        <CardContent className="space-y-2">
                             <Button className="w-full bg-green-600 hover:bg-green-700" onClick={() => handleMainStatusChange('Verified')} disabled={isSaving}>
                                {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin"/>} <ShieldCheck className="mr-2"/>Approve & Verify Organizer
                            </Button>
                             <Button variant="destructive" className="w-full" onClick={() => handleMainStatusChange('Rejected')} disabled={isSaving}>
                                {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin"/>}<ShieldX className="mr-2"/>Reject Organizer
                            </Button>
                             <Button variant="secondary" className="w-full" onClick={() => handleMainStatusChange('Suspended')} disabled={isSaving}>
                                {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin"/>}<Ban className="mr-2"/>Suspend Organizer
                            </Button>
                             <Button variant="outline" className="w-full" onClick={() => handleMainStatusChange('Pending')} disabled={isSaving}>
                                {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin"/>}<RefreshCw className="mr-2"/>Reset to Pending
                            </Button>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader><CardTitle>Business Information</CardTitle></CardHeader>
                        <CardContent className="text-sm space-y-2">
                            <p><strong>Type:</strong> {organizer.organizerType || 'N/A'}</p>
                            <p><strong>Email:</strong> {organizer.email}</p>
                            <p><strong>Phone:</strong> {organizer.phone || 'N/A'}</p>
                            <p><strong>Address:</strong> {organizer.address || 'N/A'}</p>
                            <p><strong>Website:</strong> <a href={organizer.website} className="text-primary hover:underline">{organizer.website || 'N/A'}</a></p>
                        </CardContent>
                    </Card>
                    
                    <Card>
                        <CardHeader><CardTitle>Financial Information</CardTitle></CardHeader>
                        <CardContent className="text-sm space-y-2 font-mono">
                            <p><strong>PAN:</strong> {organizer.pan || 'N/A'}</p>
                            <p><strong>GSTIN:</strong> {organizer.gstin || 'N/A'}</p>
                            <p><strong>Account:</strong> {organizer.bankAccountNumber || 'N/A'}</p>
                            <p><strong>IFSC:</strong> {organizer.ifscCode || 'N/A'}</p>
                        </CardContent>
                    </Card>
                    
                     <Card>
                        <CardHeader><CardTitle>Vendor Agreement</CardTitle></CardHeader>
                        <CardContent className="space-y-4">
                            <Badge>{organizer.vendorAgreementStatus}</Badge>
                            <Button variant="outline" className="w-full"><Download className="mr-2"/>Download Agreement</Button>
                            <div>
                                <Textarea placeholder="Add internal notes for this organizer..." />
                                <Button size="sm" className="mt-2">Save Note</Button>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </main>
        <DocumentPreviewDialog doc={selectedDoc} isOpen={isDocPreviewOpen} onOpenChange={setIsDocPreviewOpen} />
        </>
    )
}
