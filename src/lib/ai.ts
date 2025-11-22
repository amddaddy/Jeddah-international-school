
import { GoogleGenAI } from '@google/genai';

let apiKey = '';

// Safely access process.env.API_KEY
try {
    if (typeof process !== 'undefined' && process.env) {
        apiKey = process.env.API_KEY || '';
    }
} catch (e) {
    console.warn("Could not safely access process.env.API_KEY");
}

export const ai = new GoogleGenAI({ 
    apiKey: apiKey 
});
