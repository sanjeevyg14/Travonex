import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Bell, CheckCircle, XCircle, Gift, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";


// DEV_COMMENT: Mock notifications to demonstrate the component's structure.
// In a real application, this data would be fetched from a dedicated notifications API endpoint.
const notifications = [
    {
        id: '1',
        icon: CheckCircle,
        iconColor: 'text-green-500',
        title: 'Booking Confirmed: Rishikesh Adventure Rush',
        description: 'Your booking BK123 has been confirmed. Get ready for an adventure!',
        date: '2 days ago',
        read: false,
        link: '/bookings'
    },
    {
        id: '2',
        icon: Gift,
        iconColor: 'text-primary',
        title: 'Referral Bonus Received!',
        description: 'You received ₹1,500 in wallet credits for referring a new user.',
        date: '5 days ago',
        read: false,
        link: '/profile'
    },
    {
        id: '3',
        icon: XCircle,
        iconColor: 'text-red-500',
        title: 'Booking Cancelled',
        description: 'Your booking for the Goa Getaway has been successfully cancelled.',
        date: '1 week ago',
        read: true,
        link: '/bookings'
    },
];

export default function NotificationsPage() {
  return (
    <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
      <div className="space-y-2">
        <h1 className="text-3xl md:text-4xl font-headline font-bold tracking-tight">
          Notifications
        </h1>
        <p className="text-lg text-muted-foreground">
          Stay updated with alerts about your bookings and account activity.
        </p>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Your Notifications</CardTitle>
          <CardDescription>
            This is where you'll see updates.
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
                        <div className="flex items-center gap-2">
                           {notification.link && (
                               <Link href={notification.link}>
                                   <Button variant="outline" size="sm"><Eye className="mr-2"/> View</Button>
                               </Link>
                           )}
                           {!notification.read && <div className="h-2 w-2 rounded-full bg-primary mt-2 self-center"></div>}
                        </div>
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
