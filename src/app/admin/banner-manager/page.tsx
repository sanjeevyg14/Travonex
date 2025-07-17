/**
 * @fileoverview Admin Banner Manager Page
 *
 * @description
 * This page allows Superadmins to manage the promotional banners displayed on the
 * user-facing homepage, including uploading images, setting links, and controlling visibility.
 *
 * @developer_notes
 * - **State Management**: Uses `useState` to manage the list of banners and dialog states.
 * - **API Integration**:
 *   - `GET /api/admin/banners`: Fetch all banners.
 *   - `POST /api/admin/banners`: Create a new banner record.
 *   - `PUT /api/admin/banners/{bannerId}`: Update an existing banner.
 *   - `DELETE /api/admin/banners/{bannerId}`: Delete a banner.
 * - **File Uploads**: The "Upload Image" functionality requires integration with a file storage
 *   service (e.g., S3, Cloudinary). The backend should handle the upload and return a URL.
 */
"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { PlusCircle, Edit, Trash2 } from "lucide-react";
import type { HomeBanner } from "@/lib/types";
import Image from "next/image";

export default function AdminBannerManagerPage() {
  const [banners, setBanners] = React.useState<HomeBanner[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    const loadBanners = async () => {
      try {
        const res = await fetch('/api/admin/banners');
        const data = await res.json();
        const normalized = data.map((b: any) => ({
          id: b._id || b.id,
          title: b.title,
          imageUrl: b.imageUrl,
          linkUrl: b.linkUrl,
          isActive: b.isActive,
        }));
        setBanners(normalized);
      } catch (err) {
        console.error('Failed to load banners:', err);
      } finally {
        setIsLoading(false);
      }
    };
    loadBanners();
  }, []);

  const handleStatusToggle = async (id: string, newStatus: boolean) => {
    try {
      const res = await fetch(`/api/admin/banners/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: newStatus }),
      });
      if (!res.ok) throw new Error('Failed to update banner');
      const updated = await res.json();
      const mapped = {
        id: updated._id || updated.id,
        title: updated.title,
        imageUrl: updated.imageUrl,
        linkUrl: updated.linkUrl,
        isActive: updated.isActive,
      };
      setBanners(banners.map(b => b.id === id ? mapped : b));
    } catch (err) {
      console.error(err);
    }
  };
  
  return (
    <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
      <div className="flex items-center justify-between">
        <div className="space-y-2">
            <h1 className="text-3xl md:text-4xl font-headline font-bold tracking-tight">
            Content & Banner Manager
            </h1>
            <p className="text-lg text-muted-foreground">
            Manage homepage banners, featured content, and global alerts.
            </p>
        </div>
        {/* BACKEND: This should open a dialog to create a new banner record. POST /api/admin/banners */}
        <Button size="lg"><PlusCircle className="mr-2"/> Add Banner</Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Homepage Banners</CardTitle>
          <CardDescription>Manage the rotating banners on the main homepage.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Preview</TableHead>
                <TableHead>Title</TableHead>
                <TableHead>Link</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {banners.map(banner => (
                <TableRow key={banner.id}>
                  <TableCell>
                    <Image src={banner.imageUrl} alt={banner.title} width={120} height={60} className="rounded-md object-cover"/>
                  </TableCell>
                  <TableCell className="font-medium">{banner.title}</TableCell>
                  <TableCell><a href={banner.linkUrl} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">{banner.linkUrl}</a></TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Switch 
                        id={`status-${banner.id}`}
                        checked={banner.isActive}
                        onCheckedChange={(checked) => handleStatusToggle(banner.id, checked)}
                      />
                      <Badge variant={banner.isActive ? 'default' : 'secondary'} className={banner.isActive ? 'bg-green-600' : ''}>
                        {banner.isActive ? 'Active' : 'Inactive'}
                      </Badge>
                    </div>
                  </TableCell>
                  <TableCell className="text-right space-x-2">
                    {/* BACKEND: These buttons should trigger API calls to PUT /api/admin/banners/{id} and DELETE /api/admin/banners/{id} respectively. */}
                    <Button variant="outline" size="icon"><Edit className="h-4 w-4"/></Button>
                    <Button variant="destructive" size="icon"><Trash2 className="h-4 w-4"/></Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </main>
  );
}
