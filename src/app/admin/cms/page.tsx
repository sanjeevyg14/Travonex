/**
 * @fileoverview Admin CMS (Content Management System) Page
 *
 * @description
 * This page allows admins to manage static content across the site, such as FAQs,
 * Terms of Service, Privacy Policy, and other informational pages.
 *
 * @developer_notes
 * - **State Management**: Uses `useState` to manage the content of different pages and FAQs.
 * - **API Integration**:
 *   - **Fetch Content**: `GET /api/content/{page_slug}` should fetch the content for a specific page (e.g., 'terms-of-service').
 *   - **Update Content**: `PUT /api/content/{page_slug}` should update the page content. The backend must handle versioning and log which admin made the change.
 *   - **FAQ Management**:
 *     - `GET /api/faqs`
 *     - `POST /api/faqs`
 *     - `PUT /api/faqs/{id}`
 *     - `DELETE /api/faqs/{id}`
 * - **Rich Text Editor**: This prototype uses a simple `Textarea`. A production app should
 *   replace this with a proper rich text editor library (e.g., TipTap, TinyMCE)
 *   to provide better formatting options.
 */
"use client";

import * as React from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { PlusCircle, Trash2, Edit } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";


const mockContent = {
    'terms-of-service': "Welcome to Travenox! These terms and conditions...",
    'privacy-policy': "This Privacy Policy describes Our policies and procedures...",
    'refund-policy': "Our refund policy is designed to be fair. Full refunds are available...",
};

const initialFaqs = [
    { id: 'faq1', question: 'Is airfare included in the trip price?', answer: 'No, airfare is not included unless specified in the trip\'s "Inclusions" section.' },
    { id: 'faq2', question: 'Can I book a trip for a large group?', answer: 'Yes, please contact our support team for custom group bookings.' }
];

type Faq = typeof initialFaqs[0];

const FaqFormSchema = z.object({
  question: z.string().min(1, "Question cannot be empty."),
  answer: z.string().min(1, "Answer cannot be empty."),
});
type FaqFormData = z.infer<typeof FaqFormSchema>;


export default function AdminCmsPage() {
    const { toast } = useToast();
    const [faqs, setFaqs] = React.useState<Faq[]>(initialFaqs);
    const [isFaqDialogOpen, setIsFaqDialogOpen] = React.useState(false);
    const [editingFaq, setEditingFaq] = React.useState<Faq | null>(null);
    
    const faqForm = useForm<FaqFormData>({
        resolver: zodResolver(FaqFormSchema),
    });

    const handleSave = (page: string) => {
        // BACKEND: Call `PUT /api/content/{page}` with the new content.
        console.log(`Saving content for ${page}`);
        toast({
            title: "Content Saved",
            description: `The ${page.replace('-', ' ')} page has been updated.`,
        });
    };
    
    const handleAddNewFaq = () => {
        setEditingFaq(null);
        faqForm.reset({ question: '', answer: '' });
        setIsFaqDialogOpen(true);
    };

    const handleEditFaq = (faq: Faq) => {
        setEditingFaq(faq);
        faqForm.reset({ question: faq.question, answer: faq.answer });
        setIsFaqDialogOpen(true);
    };
    
    const handleDeleteFaq = (faqId: string) => {
        // BACKEND: Call `DELETE /api/faqs/{faqId}`
        setFaqs(faqs.filter(f => f.id !== faqId));
        toast({ title: "FAQ Deleted" });
    };
    
    const handleFaqFormSubmit = (data: FaqFormData) => {
        if (editingFaq) {
            // BACKEND: Call `PUT /api/faqs/{editingFaq.id}`
            setFaqs(faqs.map(f => f.id === editingFaq.id ? { ...f, ...data } : f));
            toast({ title: "FAQ Updated" });
        } else {
            // BACKEND: Call `POST /api/faqs`
            const newFaq = { id: `faq_${Date.now()}`, ...data };
            setFaqs([...faqs, newFaq]);
            toast({ title: "FAQ Added" });
        }
        setIsFaqDialogOpen(false);
    };

  return (
    <>
    <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
      <div className="space-y-2">
        <h1 className="text-3xl md:text-4xl font-headline font-bold tracking-tight">
          Help Center (CMS)
        </h1>
        <p className="text-lg text-muted-foreground">
          Manage static pages like FAQs, Privacy Policy, and Terms of Service.
        </p>
      </div>

       <Tabs defaultValue="terms" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="terms">Terms of Service</TabsTrigger>
          <TabsTrigger value="privacy">Privacy Policy</TabsTrigger>
          <TabsTrigger value="refund">Refund Policy</TabsTrigger>
          <TabsTrigger value="faq">FAQs</TabsTrigger>
        </TabsList>

        <TabsContent value="terms" className="mt-6">
            <Card>
                <CardHeader>
                    <CardTitle>Terms of Service</CardTitle>
                    <CardDescription>Edit the content for the public Terms of Service page.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Textarea defaultValue={mockContent['terms-of-service']} rows={15}/>
                </CardContent>
                <CardFooter>
                    {/* BACKEND: This button should trigger PUT /api/content/terms-of-service */}
                    <Button onClick={() => handleSave('terms-of-service')}>Save Terms</Button>
                </CardFooter>
            </Card>
        </TabsContent>
        <TabsContent value="privacy" className="mt-6">
             <Card>
                <CardHeader>
                    <CardTitle>Privacy Policy</CardTitle>
                    <CardDescription>Edit the content for the public Privacy Policy page.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Textarea defaultValue={mockContent['privacy-policy']} rows={15}/>
                </CardContent>
                <CardFooter>
                    {/* BACKEND: This button should trigger PUT /api/content/privacy-policy */}
                    <Button onClick={() => handleSave('privacy-policy')}>Save Privacy Policy</Button>
                </CardFooter>
            </Card>
        </TabsContent>
        <TabsContent value="refund" className="mt-6">
             <Card>
                <CardHeader>
                    <CardTitle>Refund Policy</CardTitle>
                    <CardDescription>Edit the content for the public Refund Policy page.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Textarea defaultValue={mockContent['refund-policy']} rows={15}/>
                </CardContent>
                <CardFooter>
                     {/* BACKEND: This button should trigger PUT /api/content/refund-policy */}
                    <Button onClick={() => handleSave('refund-policy')}>Save Refund Policy</Button>
                </CardFooter>
            </Card>
        </TabsContent>
         <TabsContent value="faq" className="mt-6">
             <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                    <div>
                        <CardTitle>Frequently Asked Questions (FAQs)</CardTitle>
                        <CardDescription>Add, edit, or remove FAQs that appear on your site.</CardDescription>
                    </div>
                     {/* BACKEND: This button should trigger a dialog to call POST /api/faqs */}
                    <Button onClick={handleAddNewFaq}><PlusCircle className="mr-2"/> Add FAQ</Button>
                </CardHeader>
                <CardContent className="space-y-4">
                    {faqs.map(faq => (
                        <div key={faq.id} className="p-4 border rounded-lg space-y-2">
                             <div className="flex justify-between items-center">
                                <p className="font-semibold">{faq.question}</p>
                                <div className="space-x-2">
                                    {/* BACKEND: These buttons should trigger dialogs to call PUT /api/faqs/{id} and DELETE /api/faqs/{id} */}
                                    <Button variant="ghost" size="icon" onClick={() => handleEditFaq(faq)}><Edit className="h-4 w-4"/></Button>
                                    <Button variant="ghost" size="icon" onClick={() => handleDeleteFaq(faq.id)}><Trash2 className="h-4 w-4 text-destructive"/></Button>
                                </div>
                            </div>
                            <p className="text-sm text-muted-foreground">{faq.answer}</p>
                        </div>
                    ))}
                </CardContent>
            </Card>
        </TabsContent>
       </Tabs>
    </main>
    
    <Dialog open={isFaqDialogOpen} onOpenChange={setIsFaqDialogOpen}>
        <DialogContent>
            <DialogHeader>
                <DialogTitle>{editingFaq ? 'Edit FAQ' : 'Add New FAQ'}</DialogTitle>
            </DialogHeader>
             <Form {...faqForm}>
                <form onSubmit={faqForm.handleSubmit(handleFaqFormSubmit)} className="space-y-4 py-4">
                    <FormField control={faqForm.control} name="question" render={({ field }) => (
                        <FormItem><FormLabel>Question</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                    )} />
                     <FormField control={faqForm.control} name="answer" render={({ field }) => (
                        <FormItem><FormLabel>Answer</FormLabel><FormControl><Textarea {...field} /></FormControl><FormMessage /></FormItem>
                    )} />
                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => setIsFaqDialogOpen(false)}>Cancel</Button>
                        <Button type="submit">{editingFaq ? 'Save Changes' : 'Add FAQ'}</Button>
                    </DialogFooter>
                </form>
             </Form>
        </DialogContent>
    </Dialog>
    </>
  );
}
