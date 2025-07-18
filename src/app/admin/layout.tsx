
/**
 * @fileoverview Admin Panel Layout
 * @description Provides the main sidebar and content structure for the entire admin section.
 *
 * @developer_notes
 * - **STABILITY FIX**: The entire authentication and authorization flow for the admin panel has been re-architected.
 *   This layout now acts as a central "gatekeeper". It uses a `useEffect` hook that waits for the `useAuth`
 *   context to finish loading before checking if the user is an authorized admin.
 *   - While loading, it displays a full-screen spinner, preventing any UI flash or race conditions.
 *   - If the user is not authorized, it safely redirects them to the login page.
 *   - This new architecture completely resolves the login/logout loop.
 */
"use client";

import * as React from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  AlertTriangle,
  Bell,
  Briefcase,
  Building2,
  DollarSign,
  FileClock,
  FileText,
  Globe,
  LayoutGrid,
  LayoutTemplate,
  LineChart,
  ListChecks,
  Paintbrush,
  RotateCcw,
  Settings,
  ShieldCheck,
  Tags,
  TicketPercent,
  UserCircle,
  Users,
  UserCog,
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
  SidebarSeparator,
} from '@/components/ui/sidebar';
import { Logo } from '@/components/common/Logo';
import { Header } from '@/components/common/Header';
import { useAuth } from '@/context/AuthContext';
import type { UserSession } from '@/lib/types';

// Group icons for clarity and ensure they are treated as components.
const CoreIcons = {
  Dashboard: LayoutGrid,
  Notifications: Bell,
  Reports: LineChart,
};

const OperationsIcons = {
  Bookings: Briefcase,
  Trips: ListChecks,
  Organisers: ShieldCheck,
  Users: Users,
  Cities: Building2,
  Tags: Tags, // Added Icon
};

const FinanceIcons = {
  Revenue: DollarSign,
  Payouts: DollarSign,
  Refunds: RotateCcw,
  Disputes: AlertTriangle,
};

const GrowthIcons = {
  Promotions: TicketPercent,
  BannerManager: LayoutTemplate,
  HelpCenter: FileText,
  Branding: Paintbrush,
};

const PlatformIcons = {
  Settings: Settings,
  AdminRoles: UserCog,
  AuditLog: FileClock,
  Profile: UserCircle,
};


const menuGroups = [
  {
    title: 'Core',
    items: [
      { href: '/admin/dashboard', label: 'Dashboard', icon: CoreIcons.Dashboard },
      { href: '/admin/notifications', label: 'Notifications', icon: CoreIcons.Notifications },
      { href: '/admin/reports', label: 'Reports & Analytics', icon: CoreIcons.Reports },
    ]
  },
  {
    title: 'Operations',
    items: [
      { href: '/admin/bookings', label: 'Bookings', icon: OperationsIcons.Bookings },
      { href: '/admin/trips', label: 'Trips', icon: OperationsIcons.Trips },
      { href: '/admin/trip-organisers', label: 'Organisers', icon: OperationsIcons.Organisers },
      { href: '/admin/users', label: 'Users', icon: OperationsIcons.Users },
      { href: '/admin/cities', label: 'Cities', icon: OperationsIcons.Cities },
      { href: '/admin/categories', label: 'Categories & Tags', icon: OperationsIcons.Tags },
    ]
  },
  {
    title: 'Finance',
    items: [
      { href: '/admin/revenue', label: 'Revenue', icon: FinanceIcons.Revenue },
      { href: '/admin/payouts', label: 'Payouts', icon: FinanceIcons.Payouts },
      { href: '/admin/refunds', label: 'Refunds', icon: FinanceIcons.Refunds },
      { href: '/admin/disputes', label: 'Disputes', icon: FinanceIcons.Disputes },
    ]
  },
  {
    title: 'Growth & Content',
    items: [
      { href: '/admin/promotions', label: 'Promotions', icon: GrowthIcons.Promotions },
      { href: '/admin/banner-manager', label: 'Banner Manager', icon: GrowthIcons.BannerManager },
      { href: '/admin/cms', label: 'Help Center (CMS)', icon: GrowthIcons.HelpCenter },
      { href: '/admin/branding', label: 'Branding Sheet', icon: GrowthIcons.Branding },
    ]
  },
  {
    title: 'Platform Control',
    items: [
      { href: '/admin/settings', label: 'Settings', icon: PlatformIcons.Settings },
      { href: '/admin/admin-roles', label: 'Admin Roles', icon: PlatformIcons.AdminRoles },
      { href: '/admin/audit-log', label: 'Audit Log', icon: PlatformIcons.AuditLog },
      { href: '/admin/profile', label: 'My Profile', icon: PlatformIcons.Profile },
    ]
  }
];

const roleAccess: Record<UserSession['role'], string[]> = {
  'Super Admin': menuGroups.flatMap(group => group.items.map(item => item.href)),
  'Finance Manager': ['/admin/dashboard', '/admin/revenue', '/admin/payouts', '/admin/refunds', '/admin/reports', '/admin/profile', '/admin/notifications'],
  'Operations Manager': ['/admin/dashboard', '/admin/trips', '/admin/trip-organisers', '/admin/bookings', '/admin/cities', '/admin/categories', '/admin/profile', '/admin/notifications'],
  'Support Agent': ['/admin/dashboard', '/admin/bookings', '/admin/users', '/admin/disputes', '/admin/profile', '/admin/notifications'],
  'USER': [],
  'ORGANIZER': [],
};


const AdminSidebar = () => {
  const pathname = usePathname();
  const { setOpenMobile } = useSidebar();
  const { user } = useAuth();
  const userRole = user?.role || 'USER';

  const handleLinkClick = () => {
    setOpenMobile(false);
  };

  const isLinkActive = (href: string) => {
    if (href === '/admin/dashboard') {
      return pathname === href;
    }
    return pathname.startsWith(href);
  };

  const allowedPaths = roleAccess[userRole] || [];
  const filteredMenuGroups = menuGroups.map(group => ({
    ...group,
    items: group.items.filter(item => allowedPaths.includes(item.href))
  })).filter(group => group.items.length > 0);

  return (
    <Sidebar variant="floating">
      <SidebarHeader>
        <Link href="/admin/dashboard" onClick={handleLinkClick}>
          <Logo />
        </Link>
      </SidebarHeader>
        {user && (
          <>
            <SidebarContent>
                <SidebarMenu>
                  {filteredMenuGroups.map((group, index) => (
                    <React.Fragment key={group.title}>
                      {index > 0 && <SidebarSeparator className="my-2" />}
                      <div className="px-2 pt-2 pb-1 text-xs font-semibold text-muted-foreground tracking-wider uppercase">
                        {group.title}
                      </div>
                      {group.items.map((item) => {
                        const IconComponent = item.icon;
                        return (
                          <SidebarMenuItem key={item.href}>
                            <Link href={item.href} onClick={handleLinkClick}>
                              <SidebarMenuButton
                                isActive={isLinkActive(item.href)}
                              >
                                {IconComponent && <IconComponent />}
                                <span>{item.label}</span>
                              </SidebarMenuButton>
                            </Link>
                          </SidebarMenuItem>
                        );
                      })}
                    </React.Fragment>
                  ))}
                </SidebarMenu>
            </SidebarContent>
            <SidebarFooter>
              <SidebarMenu>
                <SidebarMenuItem>
                  <Link href="/" onClick={handleLinkClick}>
                    <SidebarMenuButton>
                      <Globe />
                      <span>View Site</span>
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


export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, loading } = useAuth();
  const router = useRouter();

  const isAuthorized = React.useMemo(() => {
    if (!user) return false;
    const allowedRoles: UserSession['role'][] = [
        'Super Admin',
        'Finance Manager',
        'Operations Manager',
        'Support Agent',
    ];
    return allowedRoles.includes(user.role);
  }, [user]);

  React.useEffect(() => {
    // Wait until the auth state is fully loaded from localStorage.
    if (!loading) {
      if (!isAuthorized) {
        // If, after loading, the user is still not authorized, redirect them.
        router.push('/auth/login');
      }
    }
  }, [loading, isAuthorized, router]);

  // While loading, or if the user is not authorized and we are waiting for the
  // useEffect to trigger the redirect, show a full-screen loader.
  // This prevents any content flash and fixes the login/logout loop.
  if (loading || !isAuthorized) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // If we've passed the checks, the user is authorized and we can render the layout.
  return (
    <SidebarProvider defaultOpen={false}>
      <AdminSidebar key={user!.id} />
      <SidebarInset>
        <Header homePath="/admin/dashboard" />
        {children}
      </SidebarInset>
    </SidebarProvider>
  );
}
