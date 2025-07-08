'use server';

/**
 * @fileOverview An AI agent that suggests travel destinations based on user interests and current trip offerings.
 *
 * - destinationSuggestion - A function that suggests destinations.
 * - DestinationSuggestionInput - The input type for the destinationSuggestion function.
 * - DestinationSuggestionOutput - The return type for the destinationSuggestion function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const DestinationSuggestionInputSchema = z.object({
  interests: z
    .string()
    .describe('A comma-separated list of the user interests, e.g., history, food, adventure'),
  currentTrips: z
    .string()
    .describe('A description of the currently available trips, including destinations and activities'),
});
export type DestinationSuggestionInput = z.infer<typeof DestinationSuggestionInputSchema>;

const DestinationSuggestionOutputSchema = z.object({
  destinations: z
    .array(z.string())
    .describe('An array of destination suggestions based on the user interests and current trip offerings.'),
  reason: z
    .string()
    .describe('A short explanation of why these destinations are suggested.'),
});
export type DestinationSuggestionOutput = z.infer<typeof DestinationSuggestionOutputSchema>;

export async function destinationSuggestion(input: DestinationSuggestionInput): Promise<DestinationSuggestionOutput> {
  return destinationSuggestionFlow(input);
}

const prompt = ai.definePrompt({
  name: 'destinationSuggestionPrompt',
  input: {schema: DestinationSuggestionInputSchema},
  output: {schema: DestinationSuggestionOutputSchema},
  // DEV_COMMENT: The prompt has been made more specific to guide the AI model better,
  // including an explicit instruction to return an empty array if no matches are found.
  // This increases reliability and prevents crashes from malformed responses.
  prompt: `You are a travel expert. Your task is to suggest travel destinations from a provided list of "Current Trip Offerings" that strictly match the user's stated interests.

- You MUST only suggest destinations that are explicitly mentioned in the "Current Trip Offerings".
- If no trips match the user's interests, you MUST return an empty array for "destinations" and a reason explaining why no matches were found.
- Your reason should be engaging and helpful.

User Interests: {{{interests}}}

Current Trip Offerings: {{{currentTrips}}}
`,
});

const destinationSuggestionFlow = ai.defineFlow(
  {
    name: 'destinationSuggestionFlow',
    inputSchema: DestinationSuggestionInputSchema,
    outputSchema: DestinationSuggestionOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    
    // DEV_COMMENT: This check handles cases where the model fails to generate a valid output
    // that matches the schema, preventing the application from crashing.
    if (!output) {
      throw new Error("The AI failed to generate a valid suggestion. Please try rephrasing your interests.");
    }

    return output;
  }
);
