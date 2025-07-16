"use client";

import * as React from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutGrid,
  List,
  UserCircle,
  Globe,
  Briefcase,
  Star,
  Banknote,
  Bell,
  Loader2,
} from 'lucide-react';
import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarFooter,
  SidebarInset,
  useSidebar,
} from '@/components/ui/sidebar';
import { Logo } from '@/components/common/Logo';
import { Header } from '@/components/common/Header';
import { useAuth } from '@/context/AuthContext';

const menuItems = [
  { href: '/trip-organiser/dashboard', label: 'Dashboard', icon: LayoutGrid },
  { href: '/trip-organiser/trips', label: 'Trips', icon: List },
  { href: '/trip-organiser/bookings', label: 'Bookings', icon: Briefcase },
  { href: '/trip-organiser/reviews', label: 'Reviews', icon: Star },
  { href: '/trip-organiser/payouts', label: 'Payouts', icon: Banknote },
  { href: '/trip-organiser/notifications', label: 'Notifications', icon: Bell },
  { href: '/trip-organiser/profile', label: 'Profile & KYC', icon: UserCircle },
];

const OrganizerSidebar = () => {
  const pathname = usePathname();
  const { setOpenMobile } = useSidebar();
  const { user } = useAuth();

  const handleLinkClick = () => {
    // On mobile, close the sidebar after a navigation link is clicked for better UX.
    setOpenMobile(false);
  };
  
  const isLinkActive = (href: string) => {
    if (href === '/trip-organiser/dashboard') {
      return pathname === href;
    }
    return pathname.startsWith(href);
  };

  return (
    <Sidebar variant="floating">
      <SidebarHeader>
        <Link href="/trip-organiser/dashboard" onClick={handleLinkClick}>
          <Logo />
        </Link>
      </SidebarHeader>
      {user && (
        <>
            <SidebarContent>
              <SidebarMenu>
                {menuItems.map((item) => {
                  const IconComponent = item.icon;
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
            <SidebarFooter>
              <SidebarMenu>
                <SidebarMenuItem>
                  <Link href="/" onClick={handleLinkClick}>
                    <SidebarMenuButton>
                      <Globe />
                      <span>Switch to User View</span>
                    </SidebarMenuButton>
                  </Link>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarFooter>
        </>
      )}
    </Sidebar>
  );
};


export default function OrganizerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, loading } = useAuth();
  const router = useRouter();

  // This effect hook is the primary authorization guard.
  React.useEffect(() => {
    // We only want to check for authorization *after* the initial loading is complete.
    if (!loading) {
      // If loading is done, and there's no user or the user is not an organizer, redirect to login.
      if (!user || user.role !== 'ORGANIZER') {
        router.push('/auth/login');
      }
    }
  }, [loading, user, router]); // Re-run effect when loading or user state changes.

  // While the auth state is loading from AuthProvider, or if the user is not yet authorized, show a spinner.
  // This prevents any content flash and fixes the redirect loop.
  if (loading || !user || user.role !== 'ORGANIZER') {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // If we've passed the checks, the user is authorized and we can render the layout.
  return (
    <SidebarProvider defaultOpen={false}>
      <OrganizerSidebar />
      <SidebarInset>
        <Header homePath="/trip-organiser/dashboard" />
        {children}
      </SidebarInset>
    </SidebarProvider>
  );
}
