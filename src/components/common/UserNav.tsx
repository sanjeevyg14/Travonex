
/**
 * @fileoverview User Navigation Component
 * @description Renders the user avatar and dropdown menu, or Login/Sign Up buttons.
 * 
 * @developer_notes
 * - **STABILITY FIX**: Added "My Profile" and "Profile & KYC" links to the dropdown menus for Admins and Organizers respectively. This provides consistent navigation and fixes a usability gap.
 * - **Authentication**: This component relies on the `useAuth` hook to determine the user's session state and role.
 * - **Role-Based Menus**: The component now uses a `switch` statement to render a different dropdown menu based on the user's role ('Super Admin', 'ORGANIZER', 'USER'), ensuring a clean separation of navigation.
 * - **Logout API**: The logout action should call a backend endpoint (e.g., `POST /api/auth/logout`) to invalidate the session token/cookie on the server-side, in addition to clearing it from the client.
 */
"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Briefcase, Heart, LogOut, User as UserIcon, LayoutGrid } from "lucide-react";
import Link from "next/link";
import * as React from 'react';
import { useAuth } from "@/context/AuthContext";
import { Skeleton } from "@/components/ui/skeleton";

export function UserNav() {
  const { user, logout, loading } = useAuth();

  // While loading auth state from localStorage, show a skeleton to prevent UI flash.
  if (loading) {
    return (
      <div className="flex items-center gap-2">
        <Skeleton className="h-8 w-16" />
        <Skeleton className="h-8 w-20" />
      </div>
    );
  }

  // If user is not logged in, show Login/Sign Up buttons.
  if (!user) {
    return (
      <div className="flex items-center gap-2">
        <Button asChild variant="ghost">
          <Link href="/auth/login">Login</Link>
        </Button>
        <Button asChild>
          <Link href="/signup">Sign Up</Link>
        </Button>
      </div>
    );
  }
  
  const userRole = user.role;

  // Common dropdown elements
  const UserDropdownTrigger = (
    <DropdownMenuTrigger asChild>
      <Button variant="ghost" className="relative h-8 w-8 rounded-full">
        <Avatar className="h-8 w-8">
          <AvatarImage src={user.avatar} alt={user.name} data-ai-hint="person avatar" />
          <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
        </Avatar>
      </Button>
    </DropdownMenuTrigger>
  );

  const UserDropdownHeader = (
    <>
      <DropdownMenuLabel className="font-normal">
        <div className="flex flex-col space-y-1">
          <p className="text-sm font-medium leading-none">{user.name}</p>
          <p className="text-xs leading-none text-muted-foreground">
            {user.email}
          </p>
        </div>
      </DropdownMenuLabel>
      <DropdownMenuSeparator />
    </>
  );
  
  const UserDropdownFooter = (
    <>
      <DropdownMenuSeparator />
      <DropdownMenuItem onClick={logout} className="cursor-pointer">
        <LogOut className="mr-2 h-4 w-4" />
        <span>Log out</span>
      </DropdownMenuItem>
    </>
  );
  
  // DEV_COMMENT: Role-specific menus are now handled by a switch statement for clarity and scalability.
  // This ensures that each role receives the correct set of navigation links in their profile dropdown.
  // The `asChild` prop is used on DropdownMenuItem to correctly compose it with the Link component.
  const getRoleSpecificMenu = () => {
    switch (userRole) {
      case 'Super Admin':
      case 'Finance Manager':
      case 'Support Agent':
      case 'Operations Manager':
        return (
          <DropdownMenuGroup>
            <DropdownMenuItem asChild>
              <Link href="/admin/dashboard" className="cursor-pointer">
                <LayoutGrid className="mr-2 h-4 w-4" />
                <span>Admin Dashboard</span>
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href="/admin/profile" className="cursor-pointer">
                <UserIcon className="mr-2 h-4 w-4" />
                <span>My Profile</span>
              </Link>
            </DropdownMenuItem>
          </DropdownMenuGroup>
        );
      case 'ORGANIZER':
        return (
          <DropdownMenuGroup>
             <DropdownMenuItem asChild>
                <Link href="/trip-organiser/dashboard" className="cursor-pointer">
                    <LayoutGrid className="mr-2 h-4 w-4" />
                    <span>Organizer Dashboard</span>
                </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
                <Link href="/trip-organiser/profile" className="cursor-pointer">
                    <UserIcon className="mr-2 h-4 w-4" />
                    <span>Profile & KYC</span>
                </Link>
            </DropdownMenuItem>
          </DropdownMenuGroup>
        );
      case 'USER':
      default:
        return (
          <DropdownMenuGroup>
            <DropdownMenuItem asChild>
                <Link href="/profile" className="cursor-pointer">
                    <UserIcon className="mr-2 h-4 w-4" />
                    <span>Profile</span>
                </Link>
            </DropdownMenuItem>
             <DropdownMenuItem asChild>
                <Link href="/bookings" className="cursor-pointer">
                    <Briefcase className="mr-2 h-4 w-4" />
                    <span>My Bookings</span>
                </Link>
            </DropdownMenuItem>
             <DropdownMenuItem asChild>
                <Link href="/wishlist" className="cursor-pointer">
                    <Heart className="mr-2 h-4 w-4" />
                    <span>Wishlist</span>
                </Link>
            </DropdownMenuItem>
          </DropdownMenuGroup>
        );
    }
  };


  // If user is logged in, show the Avatar dropdown menu with role-specific items.
  return (
    <DropdownMenu>
      {UserDropdownTrigger}
      <DropdownMenuContent className="w-56" align="end" forceMount>
        {UserDropdownHeader}
        {getRoleSpecificMenu()}
        {UserDropdownFooter}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
