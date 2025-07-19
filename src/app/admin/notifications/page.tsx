/**
 * @fileoverview Admin Notifications Center Page
 *
 * @description
 * This page serves as a central hub for Superadmins to view all system-generated events
 * and notifications, such as new trip submissions, KYC approvals, and payout requests.
 *
 * @developer_notes
 * - **API Integration**: The data should be fetched from `GET /api/admin/notifications`.
 *   This endpoint should support pagination and filtering by type and read status.
 * - **Real-time Updates**: For a production environment, consider using WebSockets or a
 *   real-time database service (like Firestore) to push notifications to the admin panel instantly.
 * - **Actions**: "Mark as Read" should call `POST /api/admin/notifications/{id}/read`.
 *   The "View" buttons should deep-link to the relevant page (e.g., a specific trip or organizer profile).
 */
"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useEffect } from "react";
import { CheckCircle, Eye } from "lucide-react";
import Link from "next/link";
import { ClientOnlyDate } from "@/components/common/ClientOnlyDate";


export default function AdminNotificationsPage() {
    const [notifications, setNotifications] = React.useState<any[]>([]);

    useEffect(() => {
        fetch('/api/admin/notifications')
            .then(res => res.json())
            .then(setNotifications)
            .catch(() => setNotifications([]));
    }, []);

    const unreadNotifications = notifications.filter(n => !n.isRead);
    const allNotifications = notifications;

    const handleMarkAsRead = (id: string) => {
        // BACKEND: Call `POST /api/admin/notifications/{id}/read`
        setNotifications(
            notifications.map(n => n.id === id ? { ...n, isRead: true } : n)
        );
    }
    
    const renderNotificationList = (list: typeof notifications) => {
        if (list.length === 0) {
            return (
                <div className="text-center py-16 text-muted-foreground">
                    <CheckCircle className="mx-auto h-12 w-12 mb-4" />
                    <p>No new notifications. All caught up!</p>
                </div>
            )
        }
        
        return (
             <div className="space-y-4">
                {list.map(notification => (
                    <div key={notification.id} className={`flex items-start gap-4 p-4 rounded-lg border ${!notification.isRead ? 'bg-background' : 'bg-muted/50'}`}>
                        <notification.icon className={`h-6 w-6 mt-1 ${notification.iconColor}`} />
                        <div className="flex-1">
                            <p className={`font-semibold ${!notification.isRead ? 'text-foreground' : 'text-muted-foreground'}`}>{notification.title}</p>
                            <p className="text-sm text-muted-foreground">{notification.description}</p>
                            <div className="text-xs text-muted-foreground mt-1">
                                <ClientOnlyDate dateString={notification.timestamp} />
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                           {notification.link && (
                               <Link href={notification.link}>
                                   <Button variant="outline" size="sm"><Eye className="mr-2"/> View</Button>
                               </Link>
                           )}
                           {!notification.isRead && (
                                <Button size="sm" onClick={() => handleMarkAsRead(notification.id)}>Mark as Read</Button>
                           )}
                        </div>
                    </div>
                ))}
            </div>
        )
    }

  return (
    <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
      <div className="space-y-2">
        <h1 className="text-3xl md:text-4xl font-headline font-bold tracking-tight">
          Admin Notifications
        </h1>
        <p className="text-lg text-muted-foreground">
          View system events and send alerts to users or organizers.
        </p>
      </div>

       <Card>
           <Tabs defaultValue="unread">
                <CardHeader>
                    <CardTitle>System Events</CardTitle>
                    <CardDescription>A log of all important activities on the platform that may require your attention.</CardDescription>
                    <TabsList className="grid w-full grid-cols-2 mt-4">
                        <TabsTrigger value="unread">Unread ({unreadNotifications.length})</TabsTrigger>
                        <TabsTrigger value="all">All</TabsTrigger>
                    </TabsList>
                </CardHeader>
                <CardContent>
                    <TabsContent value="unread">
                        {renderNotificationList(unreadNotifications)}
                    </TabsContent>
                    <TabsContent value="all">
                        {renderNotificationList(allNotifications)}
                    </TabsContent>
                </CardContent>
           </Tabs>
       </Card>
    </main>
  );
}
