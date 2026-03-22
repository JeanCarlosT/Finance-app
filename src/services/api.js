/**
 * API Service for Google Apps Script Communication
 */

const GAS_URL = "https://script.google.com/macros/s/AKfycbywvfEv4VhUeMI8B4-JSEZixJzlwzssM4gfnkDRon-KoQicQdr9eIyP0rFpJ3DFuxLBVA/exec";

/**
 * Fetch financial data and UI config from GAS
 */
export const fetchFinancialData = async () => {
    try {
        const response = await fetch(GAS_URL);
        if (!response.ok) throw new Error("Network response was not ok");
        return await response.json();
    } catch (error) {
        console.error("fetchFinancialData error:", error);
        throw error;
    }
};

/**
 * Post action data to GAS
 * CORS HACK: Use text/plain;charset=utf-8 to avoid preflight (OPTIONS)
 * @param {Object} payload { action: string, ...data }
 */
export const postData = async (payload) => {
    try {
        const response = await fetch(GAS_URL, {
            method: "POST",
            headers: {
                "Content-Type": "text/plain;charset=utf-8",
            },
            body: JSON.stringify(payload),
        });

        // Note: With no-cors, the response is opaque. 
        // We cannot read response.json() or check response.ok.
        // We assume success if no error is thrown by fetch.
        return { success: true, message: "Request sent (opaque)" };
    } catch (error) {
        console.error("postData exact error:", error);
        throw error;
    }
};

/**
 * SDUI Helper: Normalizes input types.
 * Strict Rule: Always use 'textfield' for text inputs.
 */
export const normalizeInputType = (type) => {
    if (type === 'text' || type === 'texto') return 'textfield';
    return type;
};
