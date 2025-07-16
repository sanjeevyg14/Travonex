/**
 * @fileoverview Admin Trip Organizer Management Page
 * 
 * @description
 * This page allows Superadmins to view all registered trip organizers, review their profiles
 * and submitted KYC documents, and approve or reject them.
 * 
 * @developer_notes
 * - Now a client component to handle the state for the review dialog.
 * - `ReviewProfileDialog` encapsulates the logic for viewing organizer details and taking action.
 * - The `handleStatusChange` function simulates the API call (`PATCH /api/admin/organizers/{id}/status`)
 *   that would update the organizer's verification status.
 */
"use client";

import * as React from "react";
import Link from "next/link";
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
import { organizers as mockOrganizers } from "@/lib/mock-data";
import type { Organizer } from "@/lib/types";
import { Eye } from "lucide-react";

export default function AdminTripOrganisersPage() {
  const [organizers, setOrganizers] = React.useState<Organizer[]>(mockOrganizers);

  return (
    <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
      <div className="space-y-2">
        <h1 className="text-3xl md:text-4xl font-headline font-bold tracking-tight">
          Trip Organiser Management
        </h1>
        <p className="text-lg text-muted-foreground">
          Approve, manage, and monitor all trip organisers.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Organisers</CardTitle>
          <CardDescription>A list of all registered trip organisers.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Organiser</TableHead>
                <TableHead>KYC Status</TableHead>
                <TableHead>Agreement Status</TableHead>
                <TableHead>Join Date</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {organizers.map((vendor) => (
                <TableRow key={vendor.id}>
                  <TableCell>
                    <div className="font-medium">{vendor.name}</div>
                    <div className="text-sm text-muted-foreground">{vendor.email}</div>
                  </TableCell>
                   <TableCell>
                    <Badge variant={
                        vendor.kycStatus === 'Verified' ? 'default' :
                        vendor.kycStatus === 'Pending' ? 'secondary' :
                        'destructive'
                    } className={vendor.kycStatus === 'Verified' ? 'bg-green-600' : ''}>
                        {vendor.kycStatus}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={
                        vendor.vendorAgreementStatus === 'Verified' ? 'default' :
                        vendor.vendorAgreementStatus === 'Submitted' ? 'secondary' :
                        vendor.vendorAgreementStatus === 'Rejected' ? 'destructive' :
                        'outline'
                    } className={vendor.vendorAgreementStatus === 'Verified' ? 'bg-green-600' : ''}>
                        {vendor.vendorAgreementStatus}
                    </Badge>
                  </TableCell>
                  <TableCell>{vendor.joinDate}</TableCell>
                  <TableCell className="text-right">
                     <Link href={`/admin/trip-organisers/${vendor.id}`}>
                      <Button variant="outline" size="sm">
                        <Eye className="mr-2 h-4 w-4" />
                        View Profile
                      </Button>
                    </Link>
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
