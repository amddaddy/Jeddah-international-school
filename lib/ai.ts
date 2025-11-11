

// No top-level imports from '@google/genai'
// This will store the promise that resolves to the initialized AI client instance.
let aiInstancePromise: Promise<any> | null = null;
let keyWarningShown = false;

/**
 * Initializes the GoogleGenAI client by dynamically importing the package.
 * This function is called only once.
 */
const initializeAi = async () => {
    // Dynamically import the genai module. This moves the import from load-time to run-time.
    const { GoogleGenAI } = await import('@google/genai');
    
    let apiKey: string | undefined;
    try {
        // Safely access the API key from environment variables.
        if (typeof process !== 'undefined' && process.env && process.env.API_KEY) {
            apiKey = process.env.API_KEY;
        }
    } catch (e) {
        // In some sandboxed environments, accessing process can throw. This is ignored.
    }

    if (!apiKey && !keyWarningShown) {
        console.warn("API_KEY environment variable not found. AI features may fail at runtime.");
        keyWarningShown = true;
    }

    // Return a new instance of the AI client.
    // A placeholder key is used if none is found to defer errors to the actual API call.
    return new GoogleGenAI({ apiKey: apiKey || "MISSING_API_KEY" });
};

/**
 * Returns a promise that resolves to the AI client instance.
 * It ensures that initialization only happens once.
 */
const getAiInstance = () => {
    if (!aiInstancePromise) {
        aiInstancePromise = initializeAi();
    }
    return aiInstancePromise;
};

/**
 * A proxy for the `models` object. When a method like `generateContent` is called on it,
 * it first waits for the AI client to be initialized, then calls the actual method.
 */
// Fix: Cast the proxy target to `any` to resolve TypeScript errors where methods like
// `generateContent` were not found on the empty object proxy target.
const modelsProxy = new Proxy({} as any, {
    get(_target, prop) {
        // This returns an async function that wraps the actual SDK method.
        return async (...args: any[]) => {
            const aiInstance = await getAiInstance();
            const method = aiInstance.models[prop];
            
            if (typeof method === 'function') {
                // Call the original method on the `models` object.
                return method.apply(aiInstance.models, args);
            }
            // If the property is not a function, return it directly.
            return method;
        };
    }
});

/**
 * The exported 'ai' object that the application interacts with.
 * It exposes the 'models' proxy, which handles the lazy, async initialization.
 */
export const ai = {
    models: modelsProxy,
};
