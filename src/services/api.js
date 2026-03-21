/**
 * API Service for Google Apps Script Communication
 */

const GAS_URL = "https://script.google.com/macros/s/AKfycbwqXyY8Xh4PZ9y-ftVfpb3AQeZGstquj3CqlXWgE1KYwBThh9hbV8BDUBf-wvTrZ_iNldA/exec"; // Placeholder, user must update

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
 * @param {Object} payload { action: string, ...data }
 */
export const postData = async (payload) => {
    try {
        // GAS requires text/plain and no-cors for simple POST to avoid preflight issues
        const response = await fetch(GAS_URL, {
            method: "POST",
            mode: "no-cors",
            headers: {
                "Content-Type": "text/plain",
            },
            body: JSON.stringify(payload),
        });
        return response; // No-cors response is opaque
    } catch (error) {
        console.error("postData error:", error);
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
