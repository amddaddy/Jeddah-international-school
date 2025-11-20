import { GoogleGenAI } from '@google/genai';

// Initialize and export the GoogleGenAI client directly.
// This simple pattern adheres to the guidelines and avoids syntax errors.
export const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });