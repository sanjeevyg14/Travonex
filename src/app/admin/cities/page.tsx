"use client";

import * as React from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import { useEffect } from "react";
import { Switch } from "@/components/ui/switch";
import { PlusCircle } from "lucide-react";
import type { City } from "@/lib/types";
import { useToast } from "@/hooks/use-toast";

export default function AdminCitiesPage() {
  const [cities, setCities] = React.useState<City[]>([]);
  const { toast } = useToast();

  React.useEffect(() => {
    fetch('/api/cities')
  useEffect(() => {
    fetch('/api/admin/cities')
      .then(res => res.json())
      .then(setCities)
      .catch(() => setCities([]));
  }, []);

  const handleStatusToggle = (id: string, newStatus: boolean) => {
    // BACKEND: Call PUT /api/admin/cities/{id} with { enabled: newStatus }
    setCities(
      cities.map((city) =>
        city.id === id ? { ...city, enabled: newStatus } : city
      )
    );
    toast({
      title: `City ${newStatus ? "Enabled" : "Disabled"}`,
      description: `The city has been updated successfully.`,
    });
  };

  return (
    <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <h1 className="text-3xl md:text-4xl font-headline font-bold tracking-tight">
            City Management
          </h1>
          <p className="text-lg text-muted-foreground">
            Add, edit, and enable or disable cities for trip listings.
          </p>
        </div>
        <Button size="lg">
          <PlusCircle className="mr-2 h-5 w-5" />
          Add City
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Cities</CardTitle>
          <CardDescription>
            A list of all available cities on the platform.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>City Name</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {cities.map((city) => (
                <TableRow key={city.id}>
                  <TableCell className="font-medium">{city.name}</TableCell>
                  <TableCell>
                    <Badge
                      variant={city.enabled ? "default" : "secondary"}
                      className={city.enabled ? "bg-green-600" : ""}
                    >
                      {city.enabled ? "Enabled" : "Disabled"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right flex items-center justify-end gap-4">
                    <Switch
                      checked={city.enabled}
                      onCheckedChange={(checked) =>
                        handleStatusToggle(city.id, checked)
                      }
                    />
                    <Button variant="outline" size="sm">
                      Edit
                    </Button>
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
