"use client";

import { useState } from "react";
import { useForm, type SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Sparkles, Loader2, Search, Wand2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { destinationSuggestion, type DestinationSuggestionOutput } from "@/ai/flows/destination-suggestion";

const currentTrips = `
- Paris, France: Explore art at the Louvre, enjoy romantic walks by the Seine. Activities include museum tours, and fine dining.
- Kyoto, Japan: Discover ancient temples, serene gardens, and traditional tea houses. Activities include temple visits and cultural workshops.
- Queenstown, New Zealand: The adventure capital of the world. Activities include bungee jumping, hiking, and skiing.
- Rome, Italy: Dive into history with the Colosseum, Roman Forum, and Vatican City. Activities include historical tours and culinary experiences.
- Costa Rica: Immerse yourself in lush rainforests and diverse wildlife. Activities include zip-lining, surfing, and nature hikes.
`;

const FormSchema = z.object({
  interests: z.string().min(3, "Please tell us a bit more about your interests."),
});

type FormData = z.infer<typeof FormSchema>;

export function DestinationSuggestionForm() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [suggestion, setSuggestion] = useState<DestinationSuggestionOutput | null>(null);

  const form = useForm<FormData>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      interests: "",
    },
  });

  const onSubmit: SubmitHandler<FormData> = async (data) => {
    setLoading(true);
    setSuggestion(null);
    try {
      const result = await destinationSuggestion({ ...data, currentTrips });
      setSuggestion(result);
    } catch (error) {
      console.error("AI suggestion error:", error);
      toast({
        variant: "destructive",
        title: "Oh no! Something went wrong.",
        description: "We couldn't generate suggestions at this time. Please try again later.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto shadow-lg">
      <CardHeader>
        <div className="flex items-center gap-2 mb-2">
            <Wand2 className="h-6 w-6 text-primary" />
            <CardTitle className="font-headline text-2xl">Need Inspiration?</CardTitle>
        </div>
        <CardDescription>
          Tell us what you love, and our AI will suggest the perfect trip from our current offerings. e.g., "history, food, adventure"
        </CardDescription>
      </CardHeader>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <CardContent>
            <FormField
              control={form.control}
              name="interests"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="sr-only">Your Interests</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                      <Input
                        placeholder="e.g., sunny beaches, ancient history, vibrant nightlife"
                        {...field}
                        className="pl-10"
                      />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
          <CardFooter>
            <Button type="submit" disabled={loading} className="w-full">
              {loading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Sparkles className="mr-2 h-4 w-4" />
              )}
              Suggest Destinations
            </Button>
          </CardFooter>
        </form>
      </Form>
      {suggestion && (
        <CardContent>
            <h3 className="text-lg font-semibold mb-2">Our Suggestions For You:</h3>
            <p className="text-sm text-muted-foreground mb-4">{suggestion.reason}</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {suggestion.destinations.map((dest) => (
                <div key={dest} className="bg-secondary p-4 rounded-lg">
                  <p className="font-semibold">{dest}</p>
                </div>
              ))}
            </div>
        </CardContent>
      )}
    </Card>
  );
}
