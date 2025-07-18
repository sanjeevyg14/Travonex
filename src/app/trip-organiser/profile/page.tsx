
/**
 * @fileoverview Trip Organizer Profile & Onboarding Page
 * 
 * @description
 * This page serves as the central hub for Trip Organizers to manage their profile,
 * complete KYC verification, and submit necessary documents, including the vendor agreement.
 * Access to trip listing features is gated by the completion and verification of this information.
 * 
 * @developer_notes
 * - **State Management**: Uses `react-hook-form` for the main profile form to handle state, validation, and submission.
 * - **API Integration Points**:
 *   - **Profile Save**: `PUT /api/organizers/{organizerId}/profile` to save business and contact information.
 *   - **Document Upload**: `POST /api/organizers/{organizerId}/documents` with `{ docType, fileUrl }` for KYC docs.
 *   - **Agreement Upload**: `POST /api/organizers/{organizerId}/agreement` with the signed PDF URL.
 *   - **Submit for Verification**: `POST /api/organizers/{organizerId}/submit-for-verification`, which should only be possible after all docs and the agreement are uploaded. This changes the organizer's `kycStatus` to 'Pending' on the backend, which locks the profile and notifies admins.
 */
"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
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
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { UploadCloud, CheckCircle, AlertCircle, FileText, Download, ShieldCheck, ShieldAlert, ShieldX, Eye, Loader2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import type { Organizer, OrganizerDocument } from "@/lib/types";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import Image from 'next/image';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { useAuth } from "@/context/AuthContext";
import { Skeleton } from "@/components/ui/skeleton";

// Zod schema for profile form validation.
const ProfileFormSchema = z.object({
  name: z.string().min(3, "Business name is required"),
  organizerType: z.enum(['Individual', 'Sole Proprietorship', 'Private Limited', 'LLP', 'Other'], { required_error: "Please select an organizer type" }),
  phone: z.string().min(10, "A valid phone number is required"),
  address: z.string().min(10, "A valid address is required"),
  website: z.string().url("Please enter a valid URL").optional().or(z.literal('')),
  experience: z.coerce.number().min(0, "Experience must be a positive number"),
  specializations: z.array(z.string()).min(1, "Select at least one specialization"),
  authorizedSignatoryName: z.string().min(3, "Signatory name is required"),
  authorizedSignatoryId: z.string().min(5, "A valid ID (e.g., PAN) is required"),
  emergencyContact: z.string().min(10, "A valid emergency contact number is required"),
});

type ProfileFormData = z.infer<typeof ProfileFormSchema>;

// Dialog component to preview documents.
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

// Component to render individual file upload items.
const FileUploadItem = ({ doc, onUpload, onView, disabled }: { doc: OrganizerDocument; onUpload: (docType: string) => void; onView: (doc: OrganizerDocument) => void; disabled: boolean; }) => (
    <div className="flex items-center justify-between rounded-lg border p-4">
        <div>
            <p className="font-medium">{doc.docTitle}</p>
            {doc.status === 'Rejected' && doc.rejectionReason && (
                 <p className="text-xs text-destructive mt-1">Reason: {doc.rejectionReason}</p>
            )}
        </div>
        
        <div className="flex items-center gap-2">
            {(doc.status === 'Uploaded' || doc.status === 'Verified') && (
                 <Button variant="ghost" size="sm" onClick={() => onView(doc)}>
                    <Eye className="mr-2 h-4 w-4" /> View
                </Button>
            )}
            {doc.status === 'Verified' && (
                <div className="flex items-center gap-2 text-green-600 font-semibold">
                    <CheckCircle className="h-5 w-5" />
                    <span>Verified</span>
                </div>
            )}
             {doc.status === 'Uploaded' && (
                <div className="flex items-center gap-2 text-blue-600">
                    <FileText className="h-5 w-5" />
                    <span>Uploaded</span>
                </div>
            )}
            {(doc.status === 'Pending' || doc.status === 'Rejected') && (
                 <Button variant="outline" size="sm" onClick={() => onUpload(doc.docType)} disabled={disabled}>
                    <UploadCloud className="mr-2 h-4 w-4" />
                    Upload
                </Button>
            )}
        </div>
    </div>
);

// Component for displaying status banners.
const StatusBanner = ({ status }: { status: Organizer['kycStatus'] }) => {
    const banners = {
        Pending: { icon: ShieldAlert, text: 'Your profile and documents are under review. Our team will get back to you shortly.', color: 'bg-amber-100 border-amber-500 text-amber-800' },
        Rejected: { icon: ShieldX, text: 'Your verification was unsuccessful. Please review the feedback on your documents and resubmit.', color: 'bg-red-100 border-red-500 text-red-800' },
        Verified: { icon: ShieldCheck, text: 'Congratulations! Your profile is verified. You can now create and manage trip listings.', color: 'bg-green-100 border-green-500 text-green-800' },
        Incomplete: { icon: ShieldAlert, text: 'Your profile is incomplete. Please fill out all required information and upload documents to submit for verification.', color: 'bg-blue-100 border-blue-500 text-blue-800'},
        Suspended: { icon: ShieldAlert, text: 'Your account is suspended. Contact support for assistance.', color: 'bg-red-100 border-red-500 text-red-800' }
    };
    const banner = banners[status];
    if (!banner) return null;

    return (
         <div className={`mb-8 flex items-start gap-4 rounded-lg border p-4 ${banner.color}`}>
            <banner.icon className="h-6 w-6 flex-shrink-0 mt-0.5" />
            <p className="text-sm font-medium">{banner.text}</p>
        </div>
    )
}

function ProfilePageSkeleton() {
    return (
        <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
            <Skeleton className="h-10 w-1/3" />
            <Skeleton className="h-6 w-2/3" />
            <Skeleton className="h-20 w-full" />
            <Card>
                <CardHeader>
                    <Skeleton className="h-6 w-1/4" />
                    <Skeleton className="h-4 w-1/2" />
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="flex items-center gap-6">
                        <Skeleton className="h-32 w-32 rounded-full" />
                        <div className="flex-grow space-y-4">
                            <Skeleton className="h-10 w-full" />
                            <Skeleton className="h-10 w-full" />
                        </div>
                    </div>
                    <Skeleton className="h-10 w-full" />
                    <Skeleton className="h-24 w-full" />
                </CardContent>
            </Card>
        </main>
    );
}


export default function OrganizerProfilePage() {
  const { toast } = useToast();
  const { user: sessionUser, loading: authLoading, token } = useAuth();
  const [organizer, setOrganizer] = React.useState<Organizer | null>(null);
  const [isDocPreviewOpen, setIsDocPreviewOpen] = React.useState(false);
  const [selectedDoc, setSelectedDoc] = React.useState<OrganizerDocument | null>(null);
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const form = useForm<ProfileFormData>({
    resolver: zodResolver(ProfileFormSchema),
  });

  // Fetch organizer data based on the authenticated user session.
  React.useEffect(() => {
    if (!token) return;
    const loadProfile = async () => {
      try {
        const res = await fetch('/api/organizers/me/profile', {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          setOrganizer(data);
          form.reset({
            name: data.name || '',
            organizerType: data.organizerType || undefined,
            phone: data.phone || '',
            address: data.address || '',
            website: data.website || '',
            experience: data.experience || 0,
            specializations: data.specializations || [],
            authorizedSignatoryName: data.authorizedSignatoryName || '',
            authorizedSignatoryId: data.authorizedSignatoryId || '',
            emergencyContact: data.emergencyContact || '',
          });
        }
      } catch (err) {
        console.error('Failed to load organizer profile', err);
      }
    };
    loadProfile();
  }, [token, form]);

  const handleProfileSave = async (data: ProfileFormData) => {
    if (!token) return;
    form.formState.isSubmitting = true;
    try {
      const res = await fetch('/api/organizers/me/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(data)
      });
      const updated = await res.json();
      if (!res.ok) throw new Error(updated.message || 'Failed to save');
      setOrganizer(updated);
      toast({
        title: 'Profile Saved!',
        description: 'Your business information has been updated. The Vendor Agreement will be sent to your registered email.',
      });
    } catch (err) {
      console.error('Failed to save profile', err);
      toast({ title: 'Error', description: 'Failed to save profile' });
    } finally {
      form.formState.isSubmitting = false;
    }
  };
  
  const handleDocumentUpload = (docType: string) => {
    if (!organizer) return;
    console.log("Uploading document of type:", docType);
    setOrganizer(prev => prev ? {
        ...prev,
        documents: prev.documents.map(doc => doc.docType === docType ? { ...doc, status: 'Uploaded', fileUrl: '/invoices/invoice.pdf' } : doc)
    } : null);
    toast({ title: "Document Uploaded", description: "Your document is now ready for verification." });
  };
  
  const handlePreviewDoc = (doc: OrganizerDocument) => {
    setSelectedDoc(doc);
    setIsDocPreviewOpen(true);
  };
  
  const handleUploadAgreement = () => {
    if (!organizer) return;
    console.log("Uploading signed agreement...");
    setOrganizer(prev => prev ? { ...prev, vendorAgreementStatus: 'Submitted' } : null);
    toast({ title: "Agreement Uploaded", description: "Your signed agreement is now ready for verification." });
  };

  const handleSubmitForVerification = async () => {
    if (!organizer) return;
    setIsSubmitting(true);
    await new Promise(resolve => setTimeout(resolve, 300));
    console.log("Submitting all documents for verification.");
    setOrganizer(prev => prev ? { ...prev, kycStatus: 'Pending' } : null);
    toast({ title: "Submitted for Verification", description: "Our team will now review your profile and documents." });
    setIsSubmitting(false);
  };

  if (authLoading || !organizer) {
      return <ProfilePageSkeleton />;
  }

  const isReadOnly = organizer.kycStatus === 'Pending' || organizer.kycStatus === 'Verified';
  const allDocsUploaded = organizer.documents.every(doc => doc.status === 'Uploaded' || doc.status === 'Verified');
  const isAgreementUploaded = organizer.vendorAgreementStatus === 'Submitted' || organizer.vendorAgreementStatus === 'Verified';


  return (
    <>
    <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
        <div className="space-y-2">
            <h1 className="text-3xl md:text-4xl font-headline font-bold tracking-tight">
            Profile &amp; Verification
            </h1>
            <p className="text-lg text-muted-foreground">
            Manage your organizer profile and complete your KYC verification to start listing trips.
            </p>
        </div>

        <StatusBanner status={organizer.kycStatus} />

        <Form {...form}>
            <form onSubmit={form.handleSubmit(handleProfileSave)} className="space-y-8">
                <Card>
                    <CardHeader>
                        <CardTitle>Organizer Information</CardTitle>
                        <CardDescription>
                        Keep your public-facing information and contact details up to date.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="flex items-center gap-6">
                             <div className="relative">
                                <Image src={organizer.logo || 'https://placehold.co/128x128.png'} alt="Organizer Logo" width={128} height={128} className="rounded-full border" data-ai-hint="company logo"/>
                                <Button size="icon" className="absolute -bottom-2 -right-2 h-8 w-8 rounded-full" type="button" disabled={isReadOnly}>
                                    <UploadCloud className="h-4 w-4" />
                                </Button>
                            </div>
                            <div className="flex-grow grid gap-6">
                                <FormField control={form.control} name="name" render={({ field }) => (<FormItem><FormLabel>Business / Brand Name</FormLabel><FormControl><Input placeholder="e.g., Himalayan Adventures" {...field} disabled={isReadOnly} /></FormControl><FormMessage /></FormItem>)} />
                                <FormField control={form.control} name="organizerType" render={({ field }) => (<FormItem><FormLabel>Organizer Type</FormLabel><Select onValueChange={field.onChange} defaultValue={field.value} disabled={isReadOnly}><FormControl><SelectTrigger><SelectValue placeholder="Select your business type" /></SelectTrigger></FormControl><SelectContent><SelectItem value="Individual">Individual</SelectItem><SelectItem value="Sole Proprietorship">Sole Proprietorship</SelectItem><SelectItem value="Private Limited">Private Limited</SelectItem><SelectItem value="LLP">LLP</SelectItem><SelectItem value="Other">Other</SelectItem></SelectContent></Select><FormMessage /></FormItem>)} />
                            </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                             <FormField control={form.control} name="phone" render={({ field }) => (<FormItem><FormLabel>Contact Phone</FormLabel><FormControl><Input placeholder="+91..." {...field} disabled={isReadOnly} /></FormControl><FormMessage /></FormItem>)} />
                             <FormField control={form.control} name="website" render={({ field }) => (<FormItem><FormLabel>Website URL (Optional)</FormLabel><FormControl><Input placeholder="https://..." {...field} disabled={isReadOnly} /></FormControl><FormMessage /></FormItem>)} />
                        </div>
                        <FormField control={form.control} name="address" render={({ field }) => (<FormItem><FormLabel>Registered Business Address</FormLabel><FormControl><Textarea placeholder="Enter your full address" {...field} disabled={isReadOnly} /></FormControl><FormMessage /></FormItem>)} />
                        
                        <div className="border-t pt-6">
                            <h3 className="text-lg font-medium mb-4">Legal &amp; Emergency Details</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <FormField control={form.control} name="authorizedSignatoryName" render={({ field }) => (<FormItem><FormLabel>Authorized Signatory Name</FormLabel><FormControl><Input placeholder="As per PAN card" {...field} disabled={isReadOnly} /></FormControl><FormMessage /></FormItem>)} />
                                <FormField control={form.control} name="authorizedSignatoryId" render={({ field }) => (<FormItem><FormLabel>Signatory ID (PAN/Aadhaar)</FormLabel><FormControl><Input placeholder="e.g., ABCDE1234F" {...field} disabled={isReadOnly} /></FormControl><FormMessage /></FormItem>)} />
                                <FormField control={form.control} name="emergencyContact" render={({ field }) => (<FormItem className="md:col-span-2"><FormLabel>Company Emergency Contact</FormLabel><FormControl><Input placeholder="Operations contact number" {...field} disabled={isReadOnly} /></FormControl><FormMessage /></FormItem>)} />
                            </div>
                        </div>

                         <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <FormField control={form.control} name="experience" render={({ field }) => (<FormItem><FormLabel>Years of Experience</FormLabel><FormControl><Input type="number" {...field} disabled={isReadOnly} /></FormControl><FormMessage /></FormItem>)} />
                             <FormField control={form.control} name="specializations" render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Specializations</FormLabel>
                                    <FormControl>
                                        <Input
                                            placeholder="e.g., Trekking, Wildlife, Adventure"
                                            onChange={e => field.onChange(e.target.value.split(',').map(s => s.trim()))}
                                            value={Array.isArray(field.value) ? field.value.join(', ') : ''}
                                            disabled={isReadOnly}
                                            ref={field.ref}
                                        />
                                    </FormControl>
                                    <FormDescription>Separate specializations with a comma.</FormDescription>
                                    <FormMessage />
                                </FormItem>
                             )} />
                        </div>
                    </CardContent>
                    <CardFooter>
                        <Button type="submit" disabled={isReadOnly || form.formState.isSubmitting}>
                            {form.formState.isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Save Profile
                        </Button>
                    </CardFooter>
                </Card>
            </form>
        </Form>
        
        <div className="grid gap-8 md:grid-cols-2">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                    <div>
                        <CardTitle>KYC Verification</CardTitle>
                        <CardDescription>
                        Upload the required documents for verification.
                        </CardDescription>
                    </div>
                    <Badge variant={organizer.kycStatus === "Verified" ? "default" : "secondary"} className={organizer.kycStatus === 'Verified' ? 'bg-green-600' : organizer.kycStatus === 'Rejected' ? 'bg-red-600' : ''}>
                        Status: {organizer.kycStatus}
                    </Badge>
                </div>
              </CardHeader>
              <CardContent className="grid gap-4">
                {organizer.documents.map(doc => (
                    <FileUploadItem key={doc.docType} doc={doc} onUpload={handleDocumentUpload} onView={handlePreviewDoc} disabled={isReadOnly} />
                ))}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                    <div>
                        <CardTitle>Vendor Agreement</CardTitle>
                        <CardDescription>
                        Download, sign, and upload the agreement.
                        </CardDescription>
                    </div>
                     <Badge variant={organizer.vendorAgreementStatus === "Verified" ? "default" : "secondary"} className={
                        organizer.vendorAgreementStatus === 'Verified' ? 'bg-green-600' :
                        organizer.vendorAgreementStatus === 'Rejected' ? 'bg-red-600' :
                        organizer.vendorAgreementStatus === 'Submitted' ? 'bg-blue-600' : ''
                     }>
                        Status: {organizer.vendorAgreementStatus}
                    </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                 <div className="text-sm text-muted-foreground space-y-2">
                     <p>Please follow these steps to complete your vendor onboarding:</p>
                     <ol className="list-decimal list-inside">
                        <li>Download the Vendor Agreement PDF.</li>
                        <li>Print, review, and sign it physically.</li>
                        <li>Scan and upload the signed copy here.</li>
                        <li>Also reply to the agreement email with the scanned copy attached.</li>
                     </ol>
                 </div>
                 <Button variant="outline" className="w-full" type="button"><Download className="mr-2 h-4 w-4"/>Download Agreement PDF</Button>
                 
                 <div className="space-y-2">
                    <Label htmlFor="agreement-upload" className={isReadOnly ? 'text-muted-foreground' : ''}>Upload Signed Agreement (PDF)</Label>
                    <Input id="agreement-upload" type="file" accept=".pdf" disabled={isReadOnly || organizer.vendorAgreementStatus === 'Submitted'} onChange={handleUploadAgreement}/>
                     {organizer.vendorAgreementStatus === 'Submitted' && <p className="text-sm font-medium text-blue-600">Your agreement has been submitted for review.</p>}
                     {organizer.vendorAgreementStatus === 'Rejected' && <p className="text-sm font-medium text-destructive">Your agreement was rejected. Please re-upload.</p>}
                 </div>
                 
                 <div className="border-t pt-4">
                     <p className="text-sm font-semibold">Need Help? Contact Us:</p>
                     <p className="text-sm text-muted-foreground">Email: vendors@travonex.com</p>
                     <p className="text-sm text-muted-foreground">Address: Travonex Labs Pvt. Ltd., #201, Startup Tower, HSR Layout, Sector 2, Bangalore – 560102, Karnataka, India</p>
                 </div>
              </CardContent>
            </Card>
        </div>

        <Card>
            <CardFooter className="pt-6 flex justify-end">
                <Button onClick={handleSubmitForVerification} disabled={!allDocsUploaded || !isAgreementUploaded || isReadOnly || isSubmitting}>
                  {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {isReadOnly ? 'Verification in Progress' : 'Submit for Verification'}
                </Button>
            </CardFooter>
        </Card>
    </main>
    <DocumentPreviewDialog doc={selectedDoc} isOpen={isDocPreviewOpen} onOpenChange={setIsDocPreviewOpen} />
    </>
  );
}
