import { GoogleGenAI } from '@google/genai';

const apiKey = process.env.API_KEY;

if (!apiKey) {
  throw new Error("API_KEY environment variable not set. The application cannot start.");
}

/**
 * Singleton instance of the GoogleGenAI client.
 * This ensures that the client is initialized only once throughout the application's lifecycle,
 * which is a performance best practice.
 * The API key is retrieved from environment variables and is assumed to be available.
 */
export const ai = new GoogleGenAI({ apiKey });
