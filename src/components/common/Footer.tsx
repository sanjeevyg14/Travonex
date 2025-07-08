/**
 * @fileoverview Global Footer Component
 * @description Provides the site-wide footer with navigation links and branding.
 */
"use client";

import Link from 'next/link';
import { Logo } from './Logo';
import { useAuth } from '@/context/AuthContext';

export function Footer() {
  const { user } = useAuth();

  return (
    <footer className="border-t bg-muted/20">
      <div className="container mx-auto py-8 px-4 md:px-6">
        <div className="grid gap-8 md:grid-cols-4">
          <div className="space-y-4">
            <Logo />
            <p className="text-sm text-muted-foreground">
              Your next adventure awaits.
            </p>
          </div>
          <div className="space-y-2">
            <h4 className="font-semibold">Company</h4>
            <ul className="space-y-1 text-sm text-muted-foreground">
              <li><Link href="/about" className="hover:text-primary">About Us</Link></li>
              <li><Link href="/contact" className="hover:text-primary">Contact</Link></li>
            </ul>
          </div>
          <div className="space-y-2">
            <h4 className="font-semibold">Legal</h4>
            <ul className="space-y-1 text-sm text-muted-foreground">
              <li><Link href="/terms" className="hover:text-primary">Terms of Service</Link></li>
              <li><Link href="/privacy" className="hover:text-primary">Privacy Policy</Link></li>
            </ul>
          </div>
          <div className="space-y-2">
            <h4 className="font-semibold">Organizers</h4>
            {/* DEV_COMMENT: This link is now conditionally rendered. It only appears to guests. */}
            {!user && (
              <p className="text-sm text-muted-foreground">
                Are you a Trip Organizer? <Link href="/auth/login" className="font-bold text-primary hover:underline">Click here to Sign In</Link>.
              </p>
            )}
            {/* DEV_COMMENT: This link is now conditionally rendered. It only appears to logged-in regular users. */}
             {user?.role === 'USER' && (
                 <p className="text-sm text-muted-foreground">
                    Interested in listing your trips on Travonex? <Link href="/contact" className="font-bold text-primary hover:underline">Contact Us</Link>.
                </p>
            )}
          </div>
        </div>
        <div className="mt-8 border-t pt-4 text-center text-xs text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} Travonex. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
