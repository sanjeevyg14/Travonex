
/**
 * @fileoverview Admin Promotions Management Page
 * 
 * @description
 * This page allows Superadmins to create, manage, and monitor all promotional codes.
 * It's now a fully interactive client component.
 * 
 * @developer_notes
 * - **State Management**: Uses `useState` and `react-hook-form` to manage the promo code list and the creation/editing dialog.
 * - **API Integration**:
 *   - **Create**: `POST /api/admin/promotions` with the new promo code data.
 *   - **Update**: `PUT /api/admin/promotions/{promoId}` with the updated data.
 *   - **Fetch**: The initial data should be fetched from `GET /api/admin/promotions`.
 */
"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { PlusCircle, Edit, Loader2 } from "lucide-react";
import { promoCodes as mockPromoCodes } from "@/lib/mock-data";
import type { PromoCode } from "@/lib/types";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DatePicker } from "@/components/ui/datepicker";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";

const getStatusBadge = (status: 'Active' | 'Inactive' | 'Expired') => {
    switch (status) {
        case 'Active': return 'bg-green-600';
        case 'Inactive': return 'bg-gray-500';
        case 'Expired': return 'bg-red-600';
    }
}

const PromoCodeFormSchema = z.object({
  code: z.string().min(3, "Code must be at least 3 characters long."),
  type: z.enum(['Fixed', 'Percentage']),
  value: z.coerce.number().min(1, "Value must be greater than 0."),
  limit: z.coerce.number().min(1, "Usage limit must be at least 1."),
  status: z.enum(['Active', 'Inactive']),
  expiryDate: z.date(),
});

type PromoCodeFormData = z.infer<typeof PromoCodeFormSchema>;

function TableSkeleton() {
    return (
        <>
            {Array.from({ length: 3 }).map((_, i) => (
                <TableRow key={i}>
                    <TableCell><Skeleton className="h-5 w-[100px]" /></TableCell>
                    <TableCell><Skeleton className="h-5 w-[80px]" /></TableCell>
                    <TableCell><Skeleton className="h-5 w-[60px]" /></TableCell>
                    <TableCell><Skeleton className="h-5 w-[50px]" /></TableCell>
                    <TableCell><Skeleton className="h-6 w-[70px] rounded-full" /></TableCell>
                    <TableCell><Skeleton className="h-5 w-[90px]" /></TableCell>
                    <TableCell className="text-right"><Skeleton className="h-8 w-8 rounded-md" /></TableCell>
                </TableRow>
            ))}
        </>
    )
}

export default function AdminPromotionsPage() {
  const { toast } = useToast();
  const [promoCodes, setPromoCodes] = React.useState<PromoCode[]>([]);
  const [isDialogOpen, setIsDialogOpen] = React.useState(false);
  const [editingPromo, setEditingPromo] = React.useState<PromoCode | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);
  const [isSaving, setIsSaving] = React.useState(false);

  const form = useForm<PromoCodeFormData>({
    resolver: zodResolver(PromoCodeFormSchema),
  });

  React.useEffect(() => {
    // FRONTEND: Simulate API call
    setIsLoading(true);
    setTimeout(() => {
        setPromoCodes(mockPromoCodes);
        setIsLoading(false);
    }, 1000);
  }, [])

  const handleAddNew = () => {
    setEditingPromo(null);
    form.reset({
        code: '',
        type: 'Fixed',
        value: 0,
        limit: 100,
        status: 'Active',
        expiryDate: new Date(),
    });
    setIsDialogOpen(true);
  };

  const handleEdit = (promo: PromoCode) => {
    setEditingPromo(promo);
    form.reset({
        code: promo.code,
        type: promo.type,
        value: promo.value,
        limit: promo.limit,
        status: promo.status === 'Expired' ? 'Inactive' : promo.status,
        expiryDate: new Date(promo.expiryDate),
    });
    setIsDialogOpen(true);
  };
  
  const onSubmit = async (data: PromoCodeFormData) => {
    setIsSaving(true);
    // BACKEND: Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const newPromoData = {
        ...data,
        id: editingPromo ? editingPromo.id : `PROMO${Math.floor(Math.random() * 900) + 100}`,
        usage: editingPromo ? editingPromo.usage : 0,
        expiryDate: data.expiryDate.toISOString().split('T')[0],
        status: new Date(data.expiryDate) < new Date() ? 'Expired' : data.status,
    } as PromoCode

    if (editingPromo) {
        // API Call: PUT /api/admin/promotions/{editingPromo.id}
        setPromoCodes(promoCodes.map(p => p.id === editingPromo.id ? newPromoData : p));
        toast({ title: "Promo Code Updated", description: `Code ${data.code} has been updated.` });
    } else {
        // API Call: POST /api/admin/promotions
        setPromoCodes([newPromoData, ...promoCodes]);
        toast({ title: "Promo Code Created", description: `New code ${data.code} has been added.` });
    }
    
    setIsSaving(false);
    setIsDialogOpen(false);
  };

  return (
    <>
      <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
        <div className="flex items-center justify-between">
            <div className="space-y-2">
                <h1 className="text-3xl md:text-4xl font-headline font-bold tracking-tight">
                Promo Code Management
                </h1>
                <p className="text-lg text-muted-foreground">
                    Create and manage promotional codes for your users.
                </p>
            </div>
            <Button size="lg" onClick={handleAddNew}>
            <PlusCircle className="mr-2 h-5 w-5" />
            Add Promo Code
            </Button>
        </div>

        <Card>
            <CardHeader>
            <CardTitle>All Promo Codes</CardTitle>
            <CardDescription>A list of all promotional codes on the platform.</CardDescription>
            </CardHeader>
            <CardContent>
            <Table>
                <TableHeader>
                <TableRow>
                    <TableHead>Code</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Discount</TableHead>
                    <TableHead>Usage</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Expiry Date</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                </TableRow>
                </TableHeader>
                <TableBody>
                {isLoading ? <TableSkeleton /> : promoCodes.map((promo) => (
                    <TableRow key={promo.id}>
                    <TableCell className="font-mono font-medium">{promo.code}</TableCell>
                    <TableCell>{promo.type}</TableCell>
                    <TableCell>{promo.type === 'Fixed' ? `₹${promo.value}` : `${promo.value}%`}</TableCell>
                    <TableCell>{promo.usage} / {promo.limit}</TableCell>
                    <TableCell>
                        <Badge variant={'default'} className={getStatusBadge(promo.status)}>
                            {promo.status}
                        </Badge>
                    </TableCell>
                    <TableCell>{new Date(promo.expiryDate).toLocaleDateString()}</TableCell>
                    <TableCell className="text-right">
                        <Button variant="outline" size="icon" onClick={() => handleEdit(promo)}><Edit className="h-4 w-4" /></Button>
                    </TableCell>
                    </TableRow>
                ))}
                </TableBody>
            </Table>
            </CardContent>
        </Card>
      </main>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                  <DialogTitle>{editingPromo ? 'Edit Promo Code' : 'Add New Promo Code'}</DialogTitle>
                  <DialogDescription>
                      {editingPromo ? `Update the details for ${editingPromo.code}.` : 'Fill in the details to create a new promo code.'}
                  </DialogDescription>
              </DialogHeader>
              <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
                      <FormField control={form.control} name="code" render={({ field }) => (<FormItem><FormLabel>Promo Code</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
                      <div className="grid grid-cols-2 gap-4">
                        <FormField control={form.control} name="type" render={({ field }) => (<FormItem><FormLabel>Type</FormLabel><Select onValueChange={field.onChange} defaultValue={field.value}><FormControl><SelectTrigger><SelectValue/></SelectTrigger></FormControl><SelectContent><SelectItem value="Fixed">Fixed (₹)</SelectItem><SelectItem value="Percentage">Percentage (%)</SelectItem></SelectContent></Select><FormMessage /></FormItem>)} />
                        <FormField control={form.control} name="value" render={({ field }) => (<FormItem><FormLabel>Value</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>)} />
                      </div>
                      <FormField control={form.control} name="limit" render={({ field }) => (<FormItem><FormLabel>Usage Limit</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>)} />
                      <FormField control={form.control} name="expiryDate" render={({ field }) => (<FormItem className="flex flex-col"><FormLabel>Expiry Date</FormLabel><DatePicker date={field.value} setDate={field.onChange} /><FormMessage /></FormItem>)} />
                      <FormField control={form.control} name="status" render={({ field }) => (<FormItem><FormLabel>Status</FormLabel><Select onValueChange={field.onChange} defaultValue={field.value}><FormControl><SelectTrigger><SelectValue/></SelectTrigger></FormControl><SelectContent><SelectItem value="Active">Active</SelectItem><SelectItem value="Inactive">Inactive</SelectItem></SelectContent></Select><FormMessage /></FormItem>)} />
                      <DialogFooter>
                          <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
                          <Button type="submit" disabled={isSaving}>
                            {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            {editingPromo ? 'Save Changes' : 'Create Code'}
                          </Button>
                      </DialogFooter>
                  </form>
              </Form>
          </DialogContent>
      </Dialog>
    </>
  );
}
