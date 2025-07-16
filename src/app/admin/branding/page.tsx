
"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { Clipboard } from "lucide-react";

const colorPalette = [
    { role: 'Primary / CTA', name: 'Vibrant Orange', hex: '#FF9933' },
    { role: 'Accent', name: 'Golden Yellow', hex: '#FFC700' },
    { role: 'Background', name: 'Warm Parchment', hex: '#F2E6D9' },
    { role: 'Primary Text', name: 'Charcoal', hex: '#2E2E2E' },
    { role: 'Secondary Text', name: 'Slate Gray', hex: '#6B6B6B' },
];


export default function BrandingPage() {
    const { toast } = useToast();

    const handleCopy = (hex: string) => {
        navigator.clipboard.writeText(hex);
        toast({
            title: "Copied to Clipboard",
            description: `Color ${hex} has been copied.`,
        });
    };

    return (
        <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
            <div className="space-y-2">
                <h1 className="text-3xl md:text-4xl font-headline font-bold tracking-tight">
                    Color Branding Sheet
                </h1>
                <p className="text-lg text-muted-foreground">
                    Core color palette for the Travonex 1.0.0 theme.
                </p>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>UI Color Palette</CardTitle>
                    <CardDescription>
                        Here are the primary colors used in the application. Click on a color swatch or hex code to copy it.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Role / Use</TableHead>
                                <TableHead>Color Name</TableHead>
                                <TableHead>Hex Code</TableHead>
                                <TableHead>Preview</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {colorPalette.map((color) => (
                                <TableRow key={color.hex}>
                                    <TableCell className="font-semibold">{color.role}</TableCell>
                                    <TableCell>{color.name}</TableCell>
                                    <TableCell>
                                        <button 
                                            className="flex items-center gap-2 font-mono text-sm hover:text-primary"
                                            onClick={() => handleCopy(color.hex)}
                                        >
                                            {color.hex} <Clipboard className="h-4 w-4" />
                                        </button>
                                    </TableCell>
                                    <TableCell>
                                        <div
                                            className="h-8 w-24 rounded border border-border cursor-pointer"
                                            style={{ backgroundColor: color.hex }}
                                            onClick={() => handleCopy(color.hex)}
                                            title={`Click to copy ${color.hex}`}
                                        />
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </main>
    );
}
