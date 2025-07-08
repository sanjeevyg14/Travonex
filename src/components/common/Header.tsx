
/**
 * @fileoverview Global Header Component
 * @description Provides the main header for the application, including navigation trigger, search bar, and user menu.
 * 
 * @developer_notes
 * - **Search Functionality**: The search input triggers navigation to `/search?q={searchTerm}`.
 *   The backend API at `GET /api/trips` should handle the `q` parameter for full-text search across trip titles, locations, and interests.
 */
"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import * as React from 'react';
import { SidebarTrigger } from "@/components/ui/sidebar";
import { UserNav } from "@/components/common/UserNav";
import { cn } from "@/lib/utils";
import { CitySelector } from "./CitySelector";
import { Logo } from "./Logo";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";


type HeaderProps = {
  className?: string;
  homePath?: string;
};

export function Header({ className, homePath = '/' }: HeaderProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const defaultSearchTerm = searchParams.get('q') || '';
  
  const handleSearch = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      const searchTerm = e.currentTarget.value.trim();
      if(searchTerm) {
        router.push(`/search?q=${searchTerm}`);
      } else {
         router.push(`/search`);
      }
    }
  };

  const isUserPanel = homePath === '/';

  return (
    <header className={cn("sticky top-0 z-10 flex h-16 items-center gap-4 border-b bg-background/80 px-4 backdrop-blur-sm md:px-6", className)}>
      <div className="flex items-center gap-4">
        <SidebarTrigger />
        <div className="hidden md:block">
            <Link href={homePath}>
                <Logo />
            </Link>
        </div>
      </div>
      
      <div className="flex-1 flex justify-center px-4">
          {isUserPanel && (
            <div className="w-full max-w-md">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                    <Input
                        key={defaultSearchTerm} // DEV_COMMENT: Force re-render if query param changes to ensure sync
                        placeholder="Search by destination or interest..."
                        className="pl-10 w-full"
                        defaultValue={defaultSearchTerm}
                        onKeyDown={handleSearch}
                    />
                </div>
            </div>
          )}
      </div>

      <div className="flex items-center gap-4">
        {isUserPanel && (
          <div className="hidden md:flex">
            <CitySelector />
          </div>
        )}
        <UserNav />
      </div>
    </header>
  );
}
