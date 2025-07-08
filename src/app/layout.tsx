
"use client";

import './globals.css';
import { Toaster } from "@/components/ui/toaster"

import * as React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Inter } from 'next/font/google';
import { cn } from '@/lib/utils';
import {
  Briefcase,
  Heart,
  Home,
  User,
  Bell,
  Megaphone,
} from 'lucide-react';
import {
  SidebarProvider,
  Sidebar,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarInset,
  useSidebar,
} from '@/components/ui/sidebar';
import { Header } from '@/components/common/Header';
import { CityProvider } from '@/context/CityContext';
import { Footer } from '@/components/common/Footer';
import { AuthProvider, useAuth } from '@/context/AuthContext';
import { GlobalAlertBanner } from '@/components/common/GlobalAlertBanner';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
});

const menuItems = [
  { href: '/', label: 'Home', icon: Home },
  { href: '/bookings', label: 'Bookings', icon: Briefcase },
  { href: '/wishlist', label: 'Wishlist', icon: Heart },
  { href: '/notifications', label: 'Notifications', icon: Bell },
  { href: '/profile', label: 'Profile', icon: User },
];

const MainSidebar = () => {
  const pathname = usePathname();
  const { setOpenMobile } = useSidebar();
  const { user } = useAuth(); // Consume auth context

  const handleLinkClick = () => {
    // On mobile, close the sidebar after a navigation link is clicked for better UX.
    setOpenMobile(false);
  };
  
  const isLinkActive = (href: string) => {
    // Strict match for the homepage, startsWith for all other parent routes.
    if (href === '/') return pathname === href;
    return pathname.startsWith(href);
  };

  return (
    <Sidebar variant="floating">
      <SidebarContent>
        <SidebarMenu>
          {menuItems.map((item) => {
            const IconComponent = item.icon;
            
            // This is the main user sidebar. It should only show user-specific links
            // if the user is a guest (for home) or has the 'USER' role.
            // It should NOT show these links for Admins or Organizers.
            if (item.href !== '/') {
              if (!user || user.role !== 'USER') {
                return null;
              }
            }

            return (
              <SidebarMenuItem key={item.href}>
                <Link href={item.href} onClick={handleLinkClick}>
                  <SidebarMenuButton
                    isActive={isLinkActive(item.href)}
                  >
                    <IconComponent />
                    <span>{item.label}</span>
                  </SidebarMenuButton>
                </Link>
              </SidebarMenuItem>
            )
          })}
        </SidebarMenu>
      </SidebarContent>
    </Sidebar>
  );
};


export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const pathname = usePathname();
  const isAuthPage = pathname.startsWith('/auth');
  const isAdminPage = pathname.startsWith('/admin');
  const isOrganizerPage = pathname.startsWith('/trip-organiser');
  const isBookingSuccessPage = pathname.startsWith('/booking/success');


  const showMainLayout = !isAuthPage && !isAdminPage && !isOrganizerPage && !isBookingSuccessPage;

  return (
    <html lang="en" suppressHydrationWarning>
      <body className={cn("font-body antialiased", inter.variable)}>
        <AuthProvider>
          <CityProvider>
            {showMainLayout ? (
              <SidebarProvider defaultOpen={false}>
                <MainSidebar />
                <SidebarInset>
                  <Header />
                  <GlobalAlertBanner />
                  <div className="flex-1">
                    {children}
                  </div>
                  <Footer />
                </SidebarInset>
              </SidebarProvider>
            ) : (
              <>
                {children}
              </>
            )}
            <Toaster />
          </CityProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
