import { GoogleGenAI } from '@google/genai';

// Initialize and export the GoogleGenAI client directly.
// Uses process.env.API_KEY as mandated by coding guidelines.
export const ai = new GoogleGenAI({ 
    apiKey: process.env.API_KEY 
});