

/**
 * @fileoverview TripForm Component
 * 
 * @description
 * This component provides a comprehensive form for Trip Organizers to create or edit their trip listings.
 * It's designed to be a "backend-ready" form, collecting all necessary data points as specified in the project requirements.
 * 
 * @developer_notes
 * - Uses `react-hook-form` for state management and validation.
 * - Uses `zod` for schema-based validation, ensuring data integrity before submission.
 * - Features dynamic field arrays for Itinerary, Inclusions/Exclusions, Batches, FAQs, and Cancellation Rules.
 * - Includes a real-time pricing preview for organizers to see commission and payout estimates.
 * - Image uploads are handled with placeholders; a real implementation would require a file upload service.
 * - A mandatory "Reason for Change" dialog is implemented to log all modifications.
 * - The form is broken into tabs for better user experience.
 */
"use client";

import { useFieldArray, useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import type { Trip } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { UploadCloud, PlusCircle, Trash2, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useCity } from "@/context/CityContext";
import { Switch } from "@/components/ui/switch";
import { DatePicker } from "@/components/ui/datepicker";
import { Label } from "@/components/ui/label";
import { interests as mockInterests, categories as mockCategories } from "@/lib/mock-data";
import { Checkbox } from "@/components/ui/checkbox";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";


interface TripFormProps {
  trip?: Trip; // If a trip object is passed, the form is in 'edit' mode.
  isAdmin?: boolean; // If true, shows admin-only fields like 'isFeatured'
}

// DEV_COMMENT: This Zod schema defines the validation rules for the entire trip form.
// It ensures that all required fields are present and in the correct format.
// This schema should be kept in sync with the backend validation logic.
// The data structure here should match the 'Trip' type in `src/lib/types.ts`.
const TripFormSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters long"),
  location: z.string().min(3, "Location is required"),
  city: z.string({ required_error: "Please select a destination city" }),
  // DEV_COMMENT: `tripType` and `interests` are selected by the organizer and used to power the public-facing filters on the search page.
  tripType: z.string({ required_error: "Please select a trip type" }),
  interests: z.array(z.string()).min(1, "Please select at least one interest tag."),
  difficulty: z.string({ required_error: "Please select a difficulty level" }),
  duration: z.string().min(3, "Duration is required"),
  description: z.string().min(10, "Description must be at least 10 characters long"),
  minAge: z.coerce.number().min(0),
  maxAge: z.coerce.number().min(0),
  pickupCity: z.string({ required_error: "Please select the main pickup city" }),
  isFeaturedRequest: z.boolean().default(false),
  // DEV_COMMENT: These flags are admin-only and control visibility on the homepage.
  isFeatured: z.boolean().default(false), // Admin only
  isBannerTrip: z.boolean().default(false), // Admin only
  // --- Pricing Schema ---
  price: z.coerce.number().min(0, "Price must be a positive number"),
  taxIncluded: z.boolean().default(false),
  taxPercentage: z.coerce.number().optional(),
  // --- Details Schema ---
  inclusions: z.array(z.object({ value: z.string() })).optional(),
  exclusions: z.array(z.object({ value: z.string() })).optional(),
  itinerary: z.array(z.object({
      day: z.number(),
      title: z.string().min(1, "Title is required"),
      description: z.string().min(1, "Description is required"),
  })),
  // --- Batches Schema ---
  batches: z.array(z.object({
      startDate: z.date({ required_error: "Start date is required" }),
      endDate: z.date({ required_error: "End date is required" }),
      bookingCutoffDate: z.date().optional(),
      maxParticipants: z.coerce.number().min(1, "Must have at least 1 participant"),
      status: z.enum(['Active', 'Inactive', 'Pending Approval', 'Rejected']),
      priceOverride: z.coerce.number().optional(),
      notes: z.string().optional(),
  })),
  // DEV_COMMENT: START - Pickup/Drop-off Points Schema.
  // Stored as an array of objects. Backend should validate `mapsLink` as a URL.
  pickupPoints: z.array(z.object({
    label: z.string().min(1, "Pickup point name is required"),
    time: z.string().min(1, "Pickup time is required"),
    mapsLink: z.string().url("Please enter a valid Google Maps URL"),
  })).min(1, "At least one pickup point is required."),
  dropoffPoints: z.array(z.object({
    label: z.string().min(1, "Drop-off point name is required"),
    time: z.string().min(1, "Drop-off time is required"),
    mapsLink: z.string().url("Please enter a valid Google Maps URL"),
  })).min(1, "At least one drop-off point is required."),
  // DEV_COMMENT: END - Pickup/Drop-off Points Schema.
  // --- Policies & FAQs Schema ---
  cancellationPolicy: z.string().optional(),
  cancellationRules: z.array(z.object({
      days: z.coerce.number().min(0),
      refundPercentage: z.coerce.number().min(0).max(100),
  })).optional(),
  faqs: z.array(z.object({
      question: z.string().min(1, "Question cannot be empty"),
      answer: z.string().min(1, "Answer cannot be empty"),
  })).optional(),
});

type TripFormData = z.infer<typeof TripFormSchema>;

export function TripForm({ trip, isAdmin = false }: TripFormProps) {
  const isEditMode = !!trip;
  const { toast } = useToast();
  const router = useRouter();
  const { cities } = useCity();
  const availableCities = cities.filter(c => c.name !== 'All Cities');
  
  const [coverImageName, setCoverImageName] = useState<string | null>(null);
  const [galleryImageNames, setGalleryImageNames] = useState<string[]>([]);

  // State for the mandatory remarks dialog
  const [isRemarkDialogOpen, setIsRemarkDialogOpen] = useState(false);
  const [remark, setRemark] = useState("");
  const [formData, setFormData] = useState<TripFormData | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const form = useForm<TripFormData>({
    resolver: zodResolver(TripFormSchema),
    defaultValues: {
      title: trip?.title || "",
      location: trip?.location || "",
      city: trip?.city || undefined,
      tripType: trip?.tripType || undefined,
      interests: trip?.interests || [],
      difficulty: trip?.difficulty || undefined,
      duration: trip?.duration || "",
      description: trip?.description || "",
      minAge: trip?.minAge || 18,
      maxAge: trip?.maxAge || 60,
      pickupCity: trip?.pickupCity || undefined,
      pickupPoints: trip?.pickupPoints || [{ label: '', time: '', mapsLink: '' }],
      dropoffPoints: trip?.dropoffPoints || [{ label: '', time: '', mapsLink: '' }],
      isFeaturedRequest: trip?.isFeaturedRequest || false,
      isFeatured: trip?.isFeatured || false,
      isBannerTrip: trip?.isBannerTrip || false,
      price: trip?.price || 0,
      taxIncluded: trip?.taxIncluded || false,
      taxPercentage: trip?.taxPercentage || 0,
      inclusions: trip?.inclusions.map(v => ({value: v})) || [{ value: '' }],
      exclusions: trip?.exclusions.map(v => ({value: v})) || [{ value: '' }],
      itinerary: trip?.itinerary || [{ day: 1, title: "", description: "" }],
      batches: trip?.batches.map(b => ({...b, startDate: new Date(b.startDate), endDate: new Date(b.endDate), bookingCutoffDate: b.bookingCutoffDate ? new Date(b.bookingCutoffDate) : undefined, priceOverride: b.priceOverride, notes: b.notes})) || [{ startDate: new Date(), endDate: new Date(), maxParticipants: 10, status: 'Active', priceOverride: undefined, notes: '' }],
      cancellationPolicy: trip?.cancellationPolicy || "",
      cancellationRules: trip?.cancellationRules || [{ days: 30, refundPercentage: 100 }],
      faqs: trip?.faqs || [{ question: '', answer: '' }],
    },
  });
  
  const { fields: pickupPointFields, append: appendPickupPoint, remove: removePickupPoint } = useFieldArray({ control: form.control, name: "pickupPoints" });
  const { fields: dropoffPointFields, append: appendDropoffPoint, remove: removeDropoffPoint } = useFieldArray({ control: form.control, name: "dropoffPoints" });
  const { fields: itineraryFields, append: appendItinerary, remove: removeItinerary } = useFieldArray({ control: form.control, name: "itinerary" });
  const { fields: inclusionFields, append: appendInclusion, remove: removeInclusion } = useFieldArray({ control: form.control, name: "inclusions" });
  const { fields: exclusionFields, append: appendExclusion, remove: removeExclusion } = useFieldArray({ control: form.control, name: "exclusions" });
  const { fields: batchFields, append: appendBatch, remove: removeBatch } = useFieldArray({ control: form.control, name: "batches" });
  const { fields: faqFields, append: appendFaq, remove: removeFaq } = useFieldArray({ control: form.control, name: "faqs" });
  const { fields: cancellationFields, append: appendCancellation, remove: removeCancellation } = useFieldArray({ control: form.control, name: "cancellationRules" });
  
  // Step 1: Form submission triggers the dialog
  const onFormSubmit = (data: TripFormData) => {
    setFormData(data);
    if (!isEditMode) {
      // For new trips, the remark is simpler, so we bypass the dialog
      setRemark("Created new trip");
      handleConfirmSave(data, "Created new trip");
    } else {
      setIsRemarkDialogOpen(true);
    }
  };
  
  // Step 2: Dialog confirmation handles the actual submission logic
  const handleConfirmSave = async (data: TripFormData, changeRemark: string) => {
    if (isEditMode && changeRemark.length < 10) {
      toast({
        variant: "destructive",
        title: "Remark is too short.",
        description: "Please provide a more detailed reason for the change (min 10 characters).",
      });
      return;
    }

    setIsSaving(true);
    setIsRemarkDialogOpen(false);

    const endpoint = isEditMode ? `/api/trips/${trip?.id}` : '/api/trips';
    const method = isEditMode ? 'PUT' : 'POST';
    try {
      const res = await fetch(endpoint, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...data, changeRemark }),
      });
      if (!res.ok) {
        throw new Error('Failed to save trip');
      }
    } catch (err) {
      console.error('Save trip error:', err);
      toast({ variant: 'destructive', title: 'Error', description: 'Failed to save trip.' });
      setIsSaving(false);
      return;
    }
    
    toast({
        title: isEditMode ? "Trip Updated!" : "Trip Created!",
        description: `The trip "${data.title}" has been submitted for approval.`,
    });
    
    setIsSaving(false);
    setRemark("");
    setFormData(null);
    const redirectPath = isAdmin ? "/admin/trips" : "/trip-organiser/trips";
    router.push(redirectPath);
  };

  const watchedPrice = form.watch('price');
  const watchedTaxIncluded = form.watch('taxIncluded');
  const watchedTaxPercentage = form.watch('taxPercentage');

  const calculatedTax = watchedTaxIncluded ? 0 : (watchedPrice * (watchedTaxPercentage || 0)) / 100;
  const userFacingPrice = watchedPrice + calculatedTax;
  const platformCommission = userFacingPrice * 0.10; // Assumption: Commission is a fixed 10%
  const estimatedPayout = userFacingPrice - platformCommission;

  return (
    <>
    <Form {...form}>
        <form onSubmit={form.handleSubmit(onFormSubmit)} className="space-y-8">
        
        <Tabs defaultValue="basic" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="basic">Basic Info</TabsTrigger>
                <TabsTrigger value="pricing">Pricing & Images</TabsTrigger>
                <TabsTrigger value="itinerary">Itinerary & Logistics</TabsTrigger>
                <TabsTrigger value="policies">Policies & FAQs</TabsTrigger>
            </TabsList>
            
            <TabsContent value="basic">
                <Card>
                    <CardHeader><CardTitle>Basic Information</CardTitle><CardDescription>Provide the main details for your trip.</CardDescription></CardHeader>
                    <CardContent className="grid gap-6 md:grid-cols-2">
                        <FormField control={form.control} name="title" render={({ field }) => (<FormItem><FormLabel>Trip Title</FormLabel><FormControl><Input placeholder="e.g., Summer in Santorini" {...field} /></FormControl><FormMessage /></FormItem>)} />
                        <FormField control={form.control} name="location" render={({ field }) => (<FormItem><FormLabel>Display Location</FormLabel><FormControl><Input placeholder="e.g., Himalayas, India" {...field} /></FormControl><FormMessage /></FormItem>)} />
                        <FormField control={form.control} name="city" render={({ field }) => (<FormItem><FormLabel>Destination City</FormLabel><Select onValueChange={field.onChange} defaultValue={field.value}><FormControl><SelectTrigger><SelectValue placeholder="Select a destination city" /></SelectTrigger></FormControl><SelectContent>{availableCities.map(c => <SelectItem key={c.id} value={c.name}>{c.name}</SelectItem>)}</SelectContent></Select><FormMessage /></FormItem>)} />
                        <FormField control={form.control} name="tripType" render={({ field }) => (<FormItem><FormLabel>Trip Category</FormLabel><Select onValueChange={field.onChange} defaultValue={field.value}><FormControl><SelectTrigger><SelectValue placeholder="Select a trip category" /></SelectTrigger></FormControl><SelectContent>{mockCategories.filter(c => c.status === 'Active').map(c => <SelectItem key={c.id} value={c.name}>{c.name}</SelectItem>)}</SelectContent></Select><FormMessage /></FormItem>)} />
                        <FormField control={form.control} name="difficulty" render={({ field }) => (<FormItem><FormLabel>Difficulty Level</FormLabel><Select onValueChange={field.onChange} defaultValue={field.value}><FormControl><SelectTrigger><SelectValue placeholder="Select difficulty" /></SelectTrigger></FormControl><SelectContent><SelectItem value="Easy">Easy</SelectItem><SelectItem value="Moderate">Moderate</SelectItem><SelectItem value="Hard">Hard</SelectItem><SelectItem value="Challenging">Challenging</SelectItem></SelectContent></Select><FormMessage /></FormItem>)} />
                        <FormField control={form.control} name="duration" render={({ field }) => (<FormItem><FormLabel>Duration</FormLabel><FormControl><Input placeholder="e.g., 3 Days, 2 Nights" {...field} /></FormControl><FormMessage /></FormItem>)} />
                        <div className="grid grid-cols-2 gap-4">
                            <FormField control={form.control} name="minAge" render={({ field }) => (<FormItem><FormLabel>Min Age</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>)} />
                            <FormField control={form.control} name="maxAge" render={({ field }) => (<FormItem><FormLabel>Max Age</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>)} />
                        </div>
                        <FormField control={form.control} name="description" render={({ field }) => (<FormItem className="md:col-span-2"><FormLabel>Description / Highlights</FormLabel><FormControl><Textarea placeholder="Describe the trip experience..." {...field} rows={5} /></FormControl><FormMessage /></FormItem>)} />
                        
                         <FormField
                            control={form.control}
                            name="interests"
                            render={() => (
                                <FormItem className="md:col-span-2">
                                <FormLabel>Interest Tags</FormLabel>
                                <FormDescription>Select tags that best describe your trip. This helps users find your trip when they filter.</FormDescription>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-2">
                                    {mockInterests.filter(i => i.status === 'Active').map((interest) => (
                                        <FormField
                                        key={interest.id}
                                        control={form.control}
                                        name="interests"
                                        render={({ field }) => {
                                            return (
                                            <FormItem
                                                key={interest.id}
                                                className="flex flex-row items-start space-x-3 space-y-0"
                                            >
                                                <FormControl>
                                                <Checkbox
                                                    checked={field.value?.includes(interest.name)}
                                                    onCheckedChange={(checked) => {
                                                    return checked
                                                        ? field.onChange([...(field.value || []), interest.name])
                                                        : field.onChange(
                                                            field.value?.filter(
                                                            (value) => value !== interest.name
                                                            )
                                                        )
                                                    }}
                                                />
                                                </FormControl>
                                                <FormLabel className="font-normal">
                                                {interest.name}
                                                </FormLabel>
                                            </FormItem>
                                            )
                                        }}
                                        />
                                    ))}
                                </div>
                                <FormMessage />
                                </FormItem>
                            )}
                         />

                        {isAdmin ? (
                            <>
                                <FormField control={form.control} name="isFeatured" render={({ field }) => (<FormItem className="flex flex-row items-center justify-between rounded-lg border p-4"><div className="space-y-0.5"><FormLabel>Mark as Featured</FormLabel><FormDescription>Featured trips appear on the homepage.</FormDescription></div><FormControl><Switch checked={field.value} onCheckedChange={field.onChange} /></FormControl></FormItem>)} />
                                <FormField control={form.control} name="isBannerTrip" render={({ field }) => (<FormItem className="flex flex-row items-center justify-between rounded-lg border p-4"><div className="space-y-0.5"><FormLabel>Show in Homepage Banner</FormLabel><FormDescription>Adds this trip to the main banner slider.</FormDescription></div><FormControl><Switch checked={field.value} onCheckedChange={field.onChange} /></FormControl></FormItem>)} />
                            </>
                        ) : (
                            <FormField control={form.control} name="isFeaturedRequest" render={({ field }) => (<FormItem className="flex flex-row items-center justify-between rounded-lg border p-4 md:col-span-2"><div className="space-y-0.5"><FormLabel>Request to be Featured</FormLabel><FormDescription>Admins will review this request. Featured trips get more visibility.</FormDescription></div><FormControl><Switch checked={field.value} onCheckedChange={field.onChange} /></FormControl></FormItem>)} />
                        )}
                    </CardContent>
                </Card>
            </TabsContent>
            
            <TabsContent value="pricing">
                <div className="space-y-8">
                    <Card>
                        <CardHeader><CardTitle>Pricing</CardTitle><CardDescription>Set the price and tax details for your trip.</CardDescription></CardHeader>
                        <CardContent className="grid gap-6 md:grid-cols-2">
                            <div className="space-y-4">
                                <FormField control={form.control} name="price" render={({ field }) => (<FormItem><FormLabel>Default Base Price (per person)</FormLabel><FormControl><div className="relative"><span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground font-sans">₹</span><Input type="number" placeholder="0.00" className="pl-8" {...field} /></div></FormControl><FormMessage /></FormItem>)} />
                                <FormField control={form.control} name="taxIncluded" render={({ field }) => (<FormItem className="flex flex-row items-center justify-between rounded-lg border p-4"><div className="space-y-0.5"><FormLabel>Is tax included in this price?</FormLabel></div><FormControl><Switch checked={field.value} onCheckedChange={field.onChange} /></FormControl></FormItem>)} />
                                {!form.watch('taxIncluded') && <FormField control={form.control} name="taxPercentage" render={({ field }) => (<FormItem><FormLabel>Tax Percentage (%)</FormLabel><FormControl><Input type="number" placeholder="e.g., 5" {...field} /></FormControl><FormMessage /></FormItem>)} />}
                            </div>
                            <Card className="bg-muted/50">
                                <CardHeader><CardTitle className="text-lg">Pricing Summary</CardTitle></CardHeader>
                                <CardContent className="space-y-2 text-sm">
                                    <div className="flex justify-between"><span>Base Price:</span> <span className="font-medium">₹{watchedPrice.toLocaleString('en-IN')}</span></div>
                                    <div className="flex justify-between"><span>Tax:</span> <span className="font-medium">₹{calculatedTax.toLocaleString('en-IN')}</span></div>
                                    <div className="flex justify-between font-bold border-t pt-2 mt-2"><span>Total User-Facing Price:</span> <span>₹{userFacingPrice.toLocaleString('en-IN')}</span></div>
                                    <div className="flex justify-between text-muted-foreground"><span>Platform Commission (10%):</span> <span className="font-medium">-₹{platformCommission.toLocaleString('en-IN')}</span></div>
                                    <div className="flex justify-between font-semibold border-t pt-2 mt-2"><span>Estimated Payout:</span> <span>₹{estimatedPayout.toLocaleString('en-IN')}</span></div>
                                </CardContent>
                            </Card>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader><CardTitle>Images</CardTitle><CardDescription>Upload a cover image and gallery pictures.</CardDescription></CardHeader>
                        <CardContent className="grid gap-6 md:grid-cols-2">
                             <FormItem>
                                <FormLabel>Cover Image</FormLabel>
                                <FormControl>
                                    <Label htmlFor="cover-image" className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer hover:bg-muted">
                                        <div className="flex flex-col items-center justify-center pt-5 pb-6 text-center">
                                            <UploadCloud className="w-8 h-8 mb-2 text-muted-foreground" />
                                            {coverImageName ? <p className="text-sm text-foreground font-semibold">{coverImageName}</p> : <p className="text-sm text-muted-foreground">Click to upload (Min 1200x675px)</p>}
                                        </div>
                                        <Input id="cover-image" type="file" className="hidden" accept="image/png, image/jpeg, image/webp" onChange={(e) => setCoverImageName(e.target.files?.[0].name || null)} />
                                    </Label>
                                </FormControl>
                            </FormItem>
                             <FormItem>
                                <FormLabel>Gallery Images</FormLabel>
                                 <FormControl>
                                    <Label htmlFor="gallery-images" className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer hover:bg-muted">
                                        <div className="flex flex-col items-center justify-center pt-5 pb-6 text-center">
                                            <UploadCloud className="w-8 h-8 mb-2 text-muted-foreground" />
                                            {galleryImageNames.length > 0 ? <p className="text-sm text-foreground font-semibold">{galleryImageNames.length} image(s) selected</p> : <p className="text-sm text-muted-foreground">Click to upload (5-8 images)</p>}
                                        </div>
                                        <Input id="gallery-images" type="file" className="hidden" multiple accept="image/png, image/jpeg, image/webp" onChange={(e) => setGalleryImageNames(Array.from(e.target.files || []).map(f => f.name))} />
                                    </Label>
                                </FormControl>
                            </FormItem>
                        </CardContent>
                    </Card>
                </div>
            </TabsContent>

            <TabsContent value="itinerary">
                 <div className="space-y-8">
                    <Card>
                        <CardHeader><CardTitle>Itinerary</CardTitle><CardDescription>Outline the day-by-day plan for the trip.</CardDescription></CardHeader>
                        <CardContent className="space-y-4">
                            {itineraryFields.map((item, index) => (
                                <div key={item.id} className="grid grid-cols-1 md:grid-cols-12 gap-4 p-4 border rounded-lg relative">
                                     <FormField control={form.control} name={`itinerary.${index}.title`} render={({ field }) => (<FormItem className="md:col-span-4"><FormLabel>Day {index + 1} Title</FormLabel><FormControl><Input placeholder="e.g., Arrival and Sunset Viewing" {...field} /></FormControl><FormMessage /></FormItem>)} />
                                     <FormField control={form.control} name={`itinerary.${index}.description`} render={({ field }) => (<FormItem className="md:col-span-8"><FormLabel>Description</FormLabel><FormControl><Textarea placeholder="Describe the day's activities" {...field} /></FormControl><FormMessage /></FormItem>)} />
                                    <Button type="button" variant="ghost" size="icon" className="absolute top-2 right-2" onClick={() => removeItinerary(index)} disabled={itineraryFields.length <= 1}><Trash2 className="h-4 w-4 text-destructive"/></Button>
                                </div>
                            ))}
                            <Button type="button" variant="outline" onClick={() => appendItinerary({ day: itineraryFields.length + 1, title: '', description: '' })}><PlusCircle className="mr-2 h-4 w-4" /> Add Day</Button>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader><CardTitle>Pickup & Drop-off Logistics</CardTitle><CardDescription>Add one or more pickup/drop-off points and the main city.</CardDescription></CardHeader>
                        <CardContent className="space-y-8">
                             <FormField control={form.control} name="pickupCity" render={({ field }) => (<FormItem><FormLabel>Pickup City</FormLabel><Select onValueChange={field.onChange} defaultValue={field.value}><FormControl><SelectTrigger><SelectValue placeholder="Select the main pickup city for this trip" /></SelectTrigger></FormControl><SelectContent>{availableCities.map(c => <SelectItem key={c.id} value={c.name}>{c.name}</SelectItem>)}</SelectContent></Select><FormMessage /></FormItem>)} />
                             <div>
                                <h3 className="font-medium mb-2">Pickup Points</h3>
                                <div className="space-y-4">
                                {pickupPointFields.map((item, index) => (
                                    <div key={item.id} className="grid grid-cols-1 md:grid-cols-12 gap-4 p-4 border rounded-lg relative">
                                        <FormField control={form.control} name={`pickupPoints.${index}.label`} render={({ field }) => (<FormItem className="md:col-span-4"><FormLabel>Point Name</FormLabel><FormControl><Input placeholder="e.g., Delhi ISBT" {...field} /></FormControl><FormMessage /></FormItem>)} />
                                        <FormField control={form.control} name={`pickupPoints.${index}.time`} render={({ field }) => (<FormItem className="md:col-span-2"><FormLabel>Time</FormLabel><FormControl><Input placeholder="06:00 AM" {...field} /></FormControl><FormMessage /></FormItem>)} />
                                        <FormField control={form.control} name={`pickupPoints.${index}.mapsLink`} render={({ field }) => (<FormItem className="md:col-span-6"><FormLabel>Google Maps Link</FormLabel><FormControl><Input placeholder="https://maps.google.com/..." {...field} /></FormControl><FormMessage /></FormItem>)} />
                                        <Button type="button" variant="ghost" size="icon" className="absolute top-2 right-2" onClick={() => removePickupPoint(index)} disabled={pickupPointFields.length <= 1}><Trash2 className="h-4 w-4 text-destructive"/></Button>
                                    </div>
                                ))}
                                <Button type="button" variant="outline" onClick={() => appendPickupPoint({ label: '', time: '', mapsLink: '' })}><PlusCircle className="mr-2 h-4 w-4" /> Add Pickup Point</Button>
                                </div>
                            </div>
                             <div>
                                <h3 className="font-medium mb-2">Drop-off Points</h3>
                                <div className="space-y-4">
                                {dropoffPointFields.map((item, index) => (
                                    <div key={item.id} className="grid grid-cols-1 md:grid-cols-12 gap-4 p-4 border rounded-lg relative">
                                        <FormField control={form.control} name={`dropoffPoints.${index}.label`} render={({ field }) => (<FormItem className="md:col-span-4"><FormLabel>Point Name</FormLabel><FormControl><Input placeholder="e.g., Manali Bus Stand" {...field} /></FormControl><FormMessage /></FormItem>)} />
                                        <FormField control={form.control} name={`dropoffPoints.${index}.time`} render={({ field }) => (<FormItem className="md:col-span-2"><FormLabel>Time</FormLabel><FormControl><Input placeholder="06:00 PM" {...field} /></FormControl><FormMessage /></FormItem>)} />
                                        <FormField control={form.control} name={`dropoffPoints.${index}.mapsLink`} render={({ field }) => (<FormItem className="md:col-span-6"><FormLabel>Google Maps Link</FormLabel><FormControl><Input placeholder="https://maps.google.com/..." {...field} /></FormControl><FormMessage /></FormItem>)} />
                                        <Button type="button" variant="ghost" size="icon" className="absolute top-2 right-2" onClick={() => removeDropoffPoint(index)} disabled={dropoffPointFields.length <= 1}><Trash2 className="h-4 w-4 text-destructive"/></Button>
                                    </div>
                                ))}
                                <Button type="button" variant="outline" onClick={() => appendDropoffPoint({ label: '', time: '', mapsLink: '' })}><PlusCircle className="mr-2 h-4 w-4" /> Add Drop-off Point</Button>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader><CardTitle>Inclusions &amp; Exclusions</CardTitle></CardHeader>
                        <CardContent className="grid md:grid-cols-2 gap-8">
                            <div className="space-y-4">
                                <h3 className="font-medium">Inclusions</h3>
                                {inclusionFields.map((item, index) => (
                                     <FormField key={item.id} control={form.control} name={`inclusions.${index}.value`} render={({ field }) => (<FormItem><FormControl><div className="flex items-center gap-2"><Input placeholder="e.g., Accommodation" {...field} /><Button type="button" variant="ghost" size="icon" onClick={() => removeInclusion(index)} disabled={inclusionFields.length <= 1}><Trash2 className="h-4 w-4 text-destructive"/></Button></div></FormControl></FormItem>)} />
                                ))}
                                <Button type="button" variant="outline" size="sm" onClick={() => appendInclusion({value: ''})}><PlusCircle className="mr-2 h-4 w-4" /> Add Inclusion</Button>
                            </div>
                            <div className="space-y-4">
                                <h3 className="font-medium">Exclusions</h3>
                                {exclusionFields.map((item, index) => (
                                     <FormField key={item.id} control={form.control} name={`exclusions.${index}.value`} render={({ field }) => (<FormItem><FormControl><div className="flex items-center gap-2"><Input placeholder="e.g., Airfare" {...field} /><Button type="button" variant="ghost" size="icon" onClick={() => removeExclusion(index)} disabled={exclusionFields.length <= 1}><Trash2 className="h-4 w-4 text-destructive"/></Button></div></FormControl></FormItem>)} />
                                ))}
                                <Button type="button" variant="outline" size="sm" onClick={() => appendExclusion({value: ''})}><PlusCircle className="mr-2 h-4 w-4" /> Add Exclusion</Button>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </TabsContent>

            <TabsContent value="policies">
                <div className="space-y-8">
                    <Card>
                        <CardHeader><CardTitle>Batches / Departures</CardTitle><CardDescription>Manage the dates and availability for this trip. At least one batch is required.</CardDescription></CardHeader>
                        <CardContent className="space-y-4">
                            {batchFields.map((item, index) => (
                                <div key={item.id} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 p-4 border rounded-lg relative">
                                    <FormField control={form.control} name={`batches.${index}.startDate`} render={({ field }) => (<FormItem className="flex flex-col"><FormLabel>Start Date</FormLabel><DatePicker date={field.value} setDate={field.onChange} /><FormMessage /></FormItem>)} />
                                    <FormField control={form.control} name={`batches.${index}.endDate`} render={({ field }) => (<FormItem className="flex flex-col"><FormLabel>End Date</FormLabel><DatePicker date={field.value} setDate={field.onChange} /><FormMessage /></FormItem>)} />
                                    <FormField control={form.control} name={`batches.${index}.bookingCutoffDate`} render={({ field }) => (<FormItem className="flex flex-col"><FormLabel>Booking Cutoff (Optional)</FormLabel><DatePicker date={field.value} setDate={field.onChange} /><FormMessage /></FormItem>)} />
                                    <FormField control={form.control} name={`batches.${index}.maxParticipants`} render={({ field }) => (<FormItem><FormLabel>Max Participants</FormLabel><FormControl><Input type="number" placeholder="10" {...field} /></FormControl><FormMessage /></FormItem>)} />
                                    <FormField control={form.control} name={`batches.${index}.priceOverride`} render={({ field }) => (<FormItem><FormLabel>Price Override (₹)</FormLabel><FormControl><Input type="number" placeholder="Optional" {...field} /></FormControl><FormDescription>If set, this overrides the default trip price for this batch.</FormDescription><FormMessage /></FormItem>)} />
                                    <FormField control={form.control} name={`batches.${index}.notes`} render={({ field }) => (<FormItem><FormLabel>Notes</FormLabel><FormControl><Input placeholder="e.g., Festival special" {...field} /></FormControl><FormMessage /></FormItem>)} />
                                    <FormField control={form.control} name={`batches.${index}.status`} render={({ field }) => (<FormItem><FormLabel>Status</FormLabel><Select onValueChange={field.onChange} defaultValue={field.value}><FormControl><SelectTrigger><SelectValue placeholder="Select status" /></SelectTrigger></FormControl><SelectContent><SelectItem value="Active">Active</SelectItem><SelectItem value="Inactive">Inactive</SelectItem></SelectContent></Select><FormMessage /></FormItem>)} />
                                    <Button type="button" variant="ghost" size="icon" className="absolute top-2 right-2" onClick={() => removeBatch(index)} disabled={batchFields.length <= 1}><Trash2 className="h-4 w-4 text-destructive"/></Button>
                                </div>
                            ))}
                            <Button type="button" variant="outline" onClick={() => appendBatch({ startDate: new Date(), endDate: new Date(), maxParticipants: 10, status: 'Active', priceOverride: undefined, notes: '' })}><PlusCircle className="mr-2 h-4 w-4" /> Add Batch</Button>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader><CardTitle>Policies &amp; FAQs</CardTitle></CardHeader>
                        <CardContent className="space-y-8">
                            <div>
                                <h3 className="font-medium mb-2">Cancellation Policy</h3>
                                <FormField control={form.control} name="cancellationPolicy" render={({ field }) => (<FormItem><FormLabel>Policy Summary</FormLabel><FormControl><Textarea placeholder="Write a user-facing summary of the cancellation policy." {...field} /></FormControl><FormMessage /></FormItem>)} />
                                <div className="space-y-4 mt-4">
                                    <Label>Structured Rules (for automated refunds)</Label>
                                    {cancellationFields.map((item, index) => (
                                         <div key={item.id} className="flex items-end gap-2">
                                            <FormField control={form.control} name={`cancellationRules.${index}.days`} render={({ field }) => (<FormItem><FormLabel>Days Before Departure</FormLabel><FormControl><Input type="number" {...field} /></FormControl></FormItem>)} />
                                            <FormField control={form.control} name={`cancellationRules.${index}.refundPercentage`} render={({ field }) => (<FormItem><FormLabel>Refund %</FormLabel><FormControl><Input type="number" {...field} /></FormControl></FormItem>)} />
                                            <Button type="button" variant="ghost" size="icon" onClick={() => removeCancellation(index)} disabled={cancellationFields.length <= 1}><Trash2 className="h-4 w-4 text-destructive"/></Button>
                                         </div>
                                    ))}
                                    <Button type="button" variant="outline" size="sm" onClick={() => appendCancellation({ days: 15, refundPercentage: 50 })}><PlusCircle className="mr-2 h-4 w-4" /> Add Rule</Button>
                                </div>
                            </div>
                             <div>
                                <h3 className="font-medium mb-2">Frequently Asked Questions</h3>
                                 <div className="space-y-4">
                                    {faqFields.map((item, index) => (
                                        <div key={item.id} className="grid grid-cols-1 md:grid-cols-12 gap-4 p-4 border rounded-lg relative">
                                            <FormField control={form.control} name={`faqs.${index}.question`} render={({ field }) => (<FormItem className="md:col-span-5"><FormLabel>Question</FormLabel><FormControl><Input placeholder="e.g., Is this trip suitable for beginners?" {...field} /></FormControl><FormMessage /></FormItem>)} />
                                            <FormField control={form.control} name={`faqs.${index}.answer`} render={({ field }) => (<FormItem className="md:col-span-7"><FormLabel>Answer</FormLabel><FormControl><Textarea placeholder="Provide a clear answer." {...field} /></FormControl><FormMessage /></FormItem>)} />
                                            <Button type="button" variant="ghost" size="icon" className="absolute top-2 right-2" onClick={() => removeFaq(index)} disabled={faqFields.length <= 1}><Trash2 className="h-4 w-4 text-destructive"/></Button>
                                        </div>
                                    ))}
                                    <Button type="button" variant="outline" size="sm" onClick={() => appendFaq({ question: '', answer: '' })}><PlusCircle className="mr-2 h-4 w-4" /> Add FAQ</Button>
                                 </div>
                             </div>
                        </CardContent>
                    </Card>
                </div>
            </TabsContent>
        </Tabs>
        
        <Card>
            <CardFooter className="flex justify-end gap-2 pt-6">
                <Button type="button" variant="outline" onClick={() => router.back()}>Cancel</Button>
                <Button type="submit" disabled={isSaving}>
                    {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    {isEditMode ? 'Save Changes' : 'Submit for Approval'}
                </Button>
            </CardFooter>
        </Card>

        </form>
    </Form>

    {/* DEV_COMMENT: Dialog for mandatory change remarks */}
    <Dialog open={isRemarkDialogOpen} onOpenChange={setIsRemarkDialogOpen}>
        <DialogContent>
            <DialogHeader>
                <DialogTitle>Reason for Change</DialogTitle>
                <DialogDescription>
                    Please provide a brief reason for the changes you made. This will be logged for administrative review.
                </DialogDescription>
            </DialogHeader>
            <div className="py-4">
                <Label htmlFor="change-remark">Remark (Required)</Label>
                <Textarea 
                    id="change-remark" 
                    value={remark} 
                    onChange={(e) => setRemark(e.target.value)}
                    placeholder="e.g., Updated pricing for the new season, corrected a typo in the itinerary..."
                />
            </div>
            <DialogFooter>
                <Button variant="outline" onClick={() => setIsRemarkDialogOpen(false)}>Cancel</Button>
                <Button onClick={() => formData && handleConfirmSave(formData, remark)} disabled={isSaving}>
                    {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Confirm &amp; Save
                </Button>
            </DialogFooter>
        </DialogContent>
    </Dialog>
    </>
  );
}
