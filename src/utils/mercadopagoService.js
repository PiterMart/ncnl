// src/utils/mercadopagoService.js

/**
 * Service for creating MercadoPago preferences.
 * @param {Array} items - Array of items with title, quantity, unit_price
 * @returns {Promise<string>} preferenceId
 */
export async function createPreference(items) {
    // Send items to our API route
    const response = await fetch('/api/mercadopago', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items }),
    });


    if (!response.ok) {
        // Throw error if response not ok
        const errorText = await response.text();
        throw new Error(`MercadoPago fetch error: ${errorText}`);
    }

    const data = await response.json();
    console.log('MercadoPago response:', data);
    return data.preferenceId;
}
