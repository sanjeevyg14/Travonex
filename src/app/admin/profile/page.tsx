/**
 * @fileoverview Admin Profile Page
 * @description Allows an admin user to manage their account. Password changes are handled separately or via SSO in a production environment.
 * 
 * @developer_notes
 * - This page is simplified as admin password policies are often complex (e.g., managed via an identity provider).
 * - A real-world implementation might have more details like viewing assigned roles or activity logs.
 */
"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { KeyRound, Loader2, Shield } from "lucide-react";
import * as React from 'react';

// DEV_COMMENT: Admin password changes are typically handled by a Superadmin or through a different, more secure flow.
// This component now focuses on basic profile info.
const ProfileFormSchema = z.object({
  name: z.string().min(3, "Name is required."),
  email: z.string().email("A valid email is required.").optional(),
});

type ProfileFormData = z.infer<typeof ProfileFormSchema>;


export default function AdminProfilePage() {
  const { toast } = useToast();
  const [isSaving, setIsSaving] = React.useState(false);

  // In a real app, this would be fetched from /api/admin/me
  const currentUser = { name: 'Super Admin', email: 'super@travonex.com' };

  const form = useForm<ProfileFormData>({
    resolver: zodResolver(ProfileFormSchema),
    defaultValues: {
      name: currentUser.name,
      email: currentUser.email,
    },
  });

  const handleProfileUpdate = async (data: ProfileFormData) => {
    setIsSaving(true);
    // BACKEND: Call `PUT /api/admin/me/profile`.
    await new Promise(resolve => setTimeout(resolve, 1000));
    console.log("Profile update submitted:", data);
    toast({
      title: "Profile Updated",
      description: "Your name has been updated successfully.",
    });
    setIsSaving(false);
  };

  return (
    <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
      <div className="space-y-2">
        <h1 className="text-3xl md:text-4xl font-headline font-bold tracking-tight">
          My Profile
        </h1>
        <p className="text-lg text-muted-foreground">
          Manage your account settings.
        </p>
      </div>

      <Card className="max-w-2xl">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleProfileUpdate)}>
             <CardHeader>
                <CardTitle>Account Information</CardTitle>
                <CardDescription>
                    Your basic account details. Email is read-only.
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Full Name</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email (Login ID)</FormLabel>
                    <FormControl>
                      <Input type="email" {...field} readOnly disabled />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
            <CardFooter>
              <Button type="submit" disabled={isSaving}>
                {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                Update Profile
              </Button>
            </CardFooter>
          </form>
        </Form>
      </Card>

        <Card className="max-w-2xl mt-8">
            <CardHeader>
                <CardTitle>Account Security</CardTitle>
                <CardDescription>
                    Admin passwords are managed by a Superadmin or through the primary identity provider.
                </CardDescription>
            </CardHeader>
             <CardContent>
                <div className="flex items-center text-sm text-muted-foreground p-4 bg-muted/50 rounded-lg">
                    <Shield className="mr-3 h-5 w-5"/>
                    <span>For password changes or security issues, please contact your system administrator.</span>
                </div>
            </CardContent>
        </Card>
    </main>
  );
}
