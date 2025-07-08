
"use client";

import * as React from 'react';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Megaphone, X } from "lucide-react";

export function GlobalAlertBanner() {
    // In a real app, these values would be fetched from a global settings API
    // that the admin configures in /admin/settings.
    const alertSettings = {
        showAlert: true,
        title: "Special Announcement!",
        description: "We are running a special monsoon discount on all trips to Goa. Use code MONSOON20 to get 20% off!",
    };

    const [isOpen, setIsOpen] = React.useState(alertSettings.showAlert);
    
    if (!isOpen) {
        return null;
    }

    return (
        <Alert className="relative rounded-none border-x-0 border-t-0 border-b-2 border-primary bg-accent/50 text-accent-foreground pr-12">
            <Megaphone className="h-4 w-4" />
            <AlertTitle className="font-bold">{alertSettings.title}</AlertTitle>
            <AlertDescription>
                {alertSettings.description}
            </AlertDescription>
            <Button 
                variant="ghost" 
                size="icon" 
                className="absolute top-1/2 right-3 -translate-y-1/2 h-7 w-7 rounded-full text-current/70 transition-colors hover:text-current hover:bg-black/10"
                onClick={() => setIsOpen(false)}
            >
                <X className="h-4 w-4" />
                <span className="sr-only">Close banner</span>
            </Button>
        </Alert>
    );
}
