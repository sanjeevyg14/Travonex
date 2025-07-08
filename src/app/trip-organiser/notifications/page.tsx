import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Bell, CheckCircle, Banknote, AlertTriangle } from "lucide-react";

// DEV_COMMENT: Mock notifications to demonstrate the component's structure.
// In a real application, this data would be fetched from `GET /api/organizers/me/notifications`.
const notifications = [
    {
        id: '1',
        icon: CheckCircle,
        iconColor: 'text-green-500',
        title: 'Trip Approved: Rishikesh Adventure Rush',
        description: 'Your trip has been reviewed and is now published on the platform.',
        date: '1 day ago',
        read: false,
    },
    {
        id: '2',
        icon: Banknote,
        iconColor: 'text-blue-500',
        title: 'Payout Processed',
        description: 'Your payout of ₹4,32,000 for the Goa trip has been processed. UTR: N12345678901',
        date: '3 days ago',
        read: false,
    },
    {
        id: '3',
        icon: AlertTriangle,
        iconColor: 'text-amber-500',
        title: 'New Booking Received!',
        description: 'You have a new booking for 2 travelers for the Rishikesh Adventure Rush.',
        date: '4 days ago',
        read: true,
    },
];

export default function OrganizerNotificationsPage() {
  return (
    <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
      <div className="space-y-2">
        <h1 className="text-3xl md:text-4xl font-headline font-bold tracking-tight">
          Notifications
        </h1>
        <p className="text-lg text-muted-foreground">
          Stay updated with alerts about your trips, bookings, and payouts.
        </p>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Your Notifications</CardTitle>
          <CardDescription>
            This is where you'll see updates on trip approvals, new bookings, and processed payouts.
          </CardDescription>
        </CardHeader>
        <CardContent>
           {notifications.length > 0 ? (
            <div className="space-y-4">
                {notifications.map(notification => (
                    <div key={notification.id} className={`flex items-start gap-4 p-4 rounded-lg border ${!notification.read ? 'bg-background' : 'bg-muted/50'}`}>
                        <notification.icon className={`h-6 w-6 mt-1 ${notification.iconColor}`} />
                        <div className="flex-1">
                            <p className={`font-semibold ${!notification.read ? 'text-foreground' : 'text-muted-foreground'}`}>{notification.title}</p>
                            <p className="text-sm text-muted-foreground">{notification.description}</p>
                            <p className="text-xs text-muted-foreground mt-1">{notification.date}</p>
                        </div>
                        {!notification.read && <div className="h-2 w-2 rounded-full bg-primary mt-2"></div>}
                    </div>
                ))}
            </div>
          ) : (
            <div className="flex flex-1 items-center justify-center rounded-lg border border-dashed shadow-sm py-16">
              <div className="flex flex-col items-center gap-2 text-center">
                  <Bell className="h-12 w-12 text-muted-foreground" />
                  <h3 className="text-2xl font-bold tracking-tight">
                      You have no new notifications
                  </h3>
                  <p className="text-sm text-muted-foreground">
                      Check back later for updates.
                  </p>
              </div>
            </div>
           )}
        </CardContent>
      </Card>
    </main>
  );
}
