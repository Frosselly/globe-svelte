import { generateText, NoObjectGeneratedError, Output } from 'ai';
import { z } from 'zod';
import { env } from '$env/dynamic/private';
import { createGoogleGenerativeAI } from '@ai-sdk/google';
const QuerySchema = z.object({
    countriesiso3codes: z.array(z.string()),
    concept: z.string(),
    indicator: z.string().optional(),
    start: z.number(),
    end: z.number(),
    chart: z.string()
});

export async function parseUserQuery(message: string) {
    let result;
    console.log('parseUserQuery:', message);
    console.log("API KEY EXISTS:", !!env.GOOGLE_GENERATIVE_AI_API_KEY);
    console.log("Key length:", env.GOOGLE_GENERATIVE_AI_API_KEY?.length);

    const gateway = createGoogleGenerativeAI({
        apiKey: env.GOOGLE_GENERATIVE_AI_API_KEY
    });

    try {
        const { output } = await generateText({
            model: gateway('gemini-3-flash-preview'),
            output: Output.object({
                schema: QuerySchema,
                description: 'Structured query for World Bank data'
            }),
            prompt: `
            Convert this user request into structured JSON.

            User:
            ${message}
            `
        });
        result = output;
        console.log('Parsed query:', result);
    } catch (err) {
        console.error('Error parsing user query:', err);
        if (NoObjectGeneratedError.isInstance(err)) {
            console.log('NoObjectGeneratedError');
            console.log('Cause:', err.cause);
            console.log('Text:', err.text);
            console.log('Response:', err.response);
            console.log('Usage:', err.usage);

        }
    }

    return result;
}
