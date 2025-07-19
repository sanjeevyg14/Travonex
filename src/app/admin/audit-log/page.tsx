/**
 * @fileoverview Admin Audit Log / Activity Tracker Page
 *
 * @description
 * This page provides a centralized view of all critical actions performed by admins,
 * enhancing security, accountability, and debugging capabilities.
 *
 * @developer_notes
 * - **API Integration**: The primary data source should be `GET /api/admin/audit-logs`.
 *   This endpoint must support filtering by `adminId`, `action`, `module`, and a `dateRange`.
 *   The backend should perform a case-insensitive search for admin name/ID.
 * - **Data Model**: The backend should have an `admin_logs` table with fields like `admin_id`,
 *   `action_type`, `affected_module`, `affected_record_id`, `details`, `ip_address`, and `timestamp`.
 * - **Exporting**: The "Export CSV" functionality should trigger a backend process that generates
 *   a CSV file based on the current filters. The API for this could be `GET /api/admin/audit-logs/export?filter=...`.
 */
"use client";

import * as React from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Download, SlidersHorizontal } from "lucide-react";
import { useEffect } from "react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DatePicker } from "@/components/ui/datepicker";
import { ClientOnlyDate } from "@/components/common/ClientOnlyDate";
import type { AuditLog } from "@/lib/types";


export default function AdminAuditLogPage() {
    const [dateRange, setDateRange] = React.useState<{from?: Date, to?: Date}>({});
    const [auditLogs, setAuditLogs] = React.useState<AuditLog[]>([]);

    React.useEffect(() => {
    const [auditLogs, setAuditLogs] = React.useState<any[]>([]);

    useEffect(() => {
        fetch('/api/admin/audit-logs')
            .then(res => res.json())
            .then(setAuditLogs)
            .catch(() => setAuditLogs([]));
    }, []);

  return (
    <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
      <div className="space-y-2">
        <h1 className="text-3xl md:text-4xl font-headline font-bold tracking-tight">
          Audit Log
        </h1>
        <p className="text-lg text-muted-foreground">
          Track all critical actions performed by admins for transparency and debugging.
        </p>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Admin Activity</CardTitle>
            <CardDescription>A log of all significant actions taken in the admin panel.</CardDescription>
          </div>
           {/* BACKEND: The "Apply Filters" button should trigger a refetch of the audit logs from the API with the selected filter parameters. */}
          <Popover>
            <PopoverTrigger asChild>
                <Button variant="outline"><SlidersHorizontal className="mr-2"/> Filter</Button>
            </PopoverTrigger>
            <PopoverContent className="w-80 space-y-4">
                <div className="space-y-2">
                    <Label>Admin User</Label>
                    <Input placeholder="Enter admin name or ID"/>
                </div>
                 <div className="space-y-2">
                    <Label>Action Type</Label>
                    <Select>
                        <SelectTrigger><SelectValue placeholder="Select an action type"/></SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Actions</SelectItem>
                            <SelectItem value="create">Create</SelectItem>
                            <SelectItem value="update">Update</SelectItem>
                            <SelectItem value="delete">Delete</SelectItem>
                            <SelectItem value="login">Login</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
                 <div className="space-y-2">
                    <Label>Date Range</Label>
                    <div className="grid grid-cols-2 gap-2">
                        <DatePicker date={dateRange.from} setDate={(date) => setDateRange(prev => ({...prev, from: date}))} />
                        <DatePicker date={dateRange.to} setDate={(date) => setDateRange(prev => ({...prev, to: date}))} />
                    </div>
                </div>
                <Button className="w-full">Apply Filters</Button>
            </PopoverContent>
          </Popover>
        </CardHeader>
        <CardContent>
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Admin</TableHead>
                        <TableHead>Action</TableHead>
                        <TableHead>Module</TableHead>
                        <TableHead>Details</TableHead>
                        <TableHead>Timestamp</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {auditLogs.map(log => (
                        <TableRow key={log.id}>
                            <TableCell>{log.adminName} ({log.adminId})</TableCell>
                            <TableCell><Badge variant="secondary">{log.action}</Badge></TableCell>
                            <TableCell>{log.module}</TableCell>
                            <TableCell className="text-sm text-muted-foreground">{log.details}</TableCell>
                            <TableCell>
                                <ClientOnlyDate dateString={log.timestamp} />
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </CardContent>
        <CardFooter className="border-t pt-6">
            {/* BACKEND: This should trigger an API call to `GET /api/admin/audit-logs/export` with the current filters. */}
            <Button variant="outline"><Download className="mr-2"/> Export CSV</Button>
        </CardFooter>
      </Card>
    </main>
  );
}
