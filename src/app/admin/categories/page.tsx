/**
 * @fileoverview Admin Page for Managing Trip Categories and Interest Tags
 *
 * @description
 * This page allows Superadmins to create, edit, and manage the taxonomies used
 * across the platform for categorizing trips. This includes:
 * - **Categories**: High-level classifications for trips (e.g., Adventure, Relaxation).
 * - **Interest Tags**: Granular tags to describe trip activities (e.g., Hiking, Photography).
 *
 * @developer_notes
 * - **API Integration**:
 *   - `GET /api/admin/categories`, `GET /api/admin/interests`: Fetch all items.
 *   - `POST /api/admin/categories`, `POST /api/admin/interests`: Create a new item.
 *   - `PUT /api/admin/categories/{id}`, `PUT /api/admin/interests/{id}`: Update an item (name, status).
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
import { PlusCircle, Edit } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import type { Category, Interest } from "@/lib/types";
import { useAuth } from "@/context/AuthContext";


const FormSchema = z.object({
  name: z.string().min(3, "Name must be at least 3 characters."),
  status: z.boolean(),
});

type FormData = z.infer<typeof FormSchema>;

type DialogState = {
    isOpen: boolean;
    type: 'Category' | 'Interest';
    data: Category | Interest | null;
}

export default function AdminCategoriesPage() {
  const { toast } = useToast();
  const { token } = useAuth();
  const [categories, setCategories] = React.useState<Category[]>([]);
  const [interests, setInterests] = React.useState<Interest[]>([]);
  
  const [dialogState, setDialogState] = React.useState<DialogState>({ isOpen: false, type: 'Category', data: null });

  const form = useForm<FormData>({
    resolver: zodResolver(FormSchema),
  });

  React.useEffect(() => {
    if (!token) return;
    const loadData = async () => {
      try {
        const [catRes, intRes] = await Promise.all([
          fetch('/api/admin/categories', { headers: { Authorization: `Bearer ${token}` } }),
          fetch('/api/admin/interests', { headers: { Authorization: `Bearer ${token}` } }),
        ]);
        if (catRes.ok) {
          const catData = await catRes.json();
          setCategories(Array.isArray(catData) ? catData : []);
        }
        if (intRes.ok) {
          const intData = await intRes.json();
          setInterests(Array.isArray(intData) ? intData : []);
        }
      } catch (err) {
        console.error('Failed to load categories or interests', err);
      }
    };
    loadData();
  }, [token]);
  
  const handleOpenDialog = (type: 'Category' | 'Interest', data: Category | Interest | null = null) => {
    form.reset({
        name: data?.name || '',
        status: data ? data.status === 'Active' : true,
    });
    setDialogState({ isOpen: true, type, data });
  };
  
  const handleCloseDialog = () => {
    setDialogState({ isOpen: false, type: 'Category', data: null });
  }

  const onSubmit = async (formData: FormData) => {
    const { type, data } = dialogState;
    const endpoint = type === 'Category' ? '/api/admin/categories' : '/api/admin/interests';
    const method = data ? 'PUT' : 'POST';
    const url = data ? `${endpoint}/${data.id}` : endpoint;

    try {
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ name: formData.name, status: formData.status ? 'Active' : 'Inactive' })
      });
      if (!res.ok) throw new Error('Request failed');
      const item = await res.json();
      if (type === 'Category') {
        setCategories(prev => data ? prev.map(c => c.id === item.id ? item : c) : [...prev, item]);
      } else {
        setInterests(prev => data ? prev.map(i => i.id === item.id ? item : i) : [...prev, item]);
      }
      toast({ title: `${type} ${data ? 'Updated' : 'Created'}` });
    } catch (err) {
      console.error('Failed to save taxonomy', err);
      toast({ title: 'Error', description: 'Failed to save item' });
    }
    handleCloseDialog();
  };

  return (
    <>
      <main className="flex flex-1 flex-col gap-8 p-4 md:p-8">
        <div className="space-y-2">
            <h1 className="text-3xl md:text-4xl font-headline font-bold tracking-tight">
            Categories & Tags
            </h1>
            <p className="text-lg text-muted-foreground">
                Manage the categories and interest tags used for trip listings.
            </p>
        </div>
        
        <div className="grid gap-8 md:grid-cols-2">
            <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                    <div>
                        <CardTitle>Trip Categories</CardTitle>
                        <CardDescription>High-level classifications for trips.</CardDescription>
                    </div>
                    <Button onClick={() => handleOpenDialog('Category')}><PlusCircle className="mr-2"/> Add Category</Button>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader><TableRow><TableHead>Name</TableHead><TableHead>Status</TableHead><TableHead className="text-right">Actions</TableHead></TableRow></TableHeader>
                        <TableBody>
                            {categories.map((cat) => (
                                <TableRow key={cat.id}>
                                    <TableCell className="font-medium">{cat.name}</TableCell>
                                    <TableCell><Badge variant={cat.status === 'Active' ? 'default' : 'secondary'}>{cat.status}</Badge></TableCell>
                                    <TableCell className="text-right"><Button variant="outline" size="icon" onClick={() => handleOpenDialog('Category', cat)}><Edit className="h-4 w-4"/></Button></TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

            <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                    <div>
                        <CardTitle>Interest Tags</CardTitle>
                        <CardDescription>Granular tags for filtering trips.</CardDescription>
                    </div>
                    <Button onClick={() => handleOpenDialog('Interest')}><PlusCircle className="mr-2"/> Add Tag</Button>
                </CardHeader>
                <CardContent>
                     <Table>
                        <TableHeader><TableRow><TableHead>Name</TableHead><TableHead>Status</TableHead><TableHead className="text-right">Actions</TableHead></TableRow></TableHeader>
                        <TableBody>
                            {interests.map((tag) => (
                                <TableRow key={tag.id}>
                                    <TableCell className="font-medium">{tag.name}</TableCell>
                                    <TableCell><Badge variant={tag.status === 'Active' ? 'default' : 'secondary'}>{tag.status}</Badge></TableCell>
                                    <TableCell className="text-right"><Button variant="outline" size="icon" onClick={() => handleOpenDialog('Interest', tag)}><Edit className="h-4 w-4"/></Button></TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>

      </main>

       <Dialog open={dialogState.isOpen} onOpenChange={handleCloseDialog}>
          <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                  <DialogTitle>{dialogState.data ? 'Edit' : 'Add New'} {dialogState.type}</DialogTitle>
              </DialogHeader>
              <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
                      <FormField control={form.control} name="name" render={({ field }) => (<FormItem><FormLabel>Name</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
                      <FormField control={form.control} name="status" render={({ field }) => (<FormItem className="flex flex-row items-center justify-between rounded-lg border p-3"><FormLabel>Active</FormLabel><FormControl><Switch checked={field.value} onCheckedChange={field.onChange} /></FormControl></FormItem>)} />
                      <DialogFooter>
                          <Button type="button" variant="outline" onClick={handleCloseDialog}>Cancel</Button>
                          <Button type="submit">{dialogState.data ? 'Save Changes' : 'Create'}</Button>
                      </DialogFooter>
                  </form>
              </Form>
          </DialogContent>
      </Dialog>
    </>
  );
}
