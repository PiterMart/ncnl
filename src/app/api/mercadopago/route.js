import { MercadoPagoConfig, Preference } from 'mercadopago';
import { NextResponse } from 'next/server';

// Initialize MercadoPago client with access token from env
const client = new MercadoPagoConfig({
    accessToken: process.env.MP_ACCESS_TOKEN, // Use environment variable
    options: { timeout: 10000 },
});
const preferenceClient = new Preference(client);

/**
 * Calculate total amount from cart items.
 * @param {Array} items - List of items with unit_price and quantity.
 * @returns {number} - Total amount.
 * @throws {Error} - If items are invalid or prices/quantities are not numbers.
 */
function calculateTotal(items) {
    if (!items || !Array.isArray(items) || items.length === 0) {
        throw new Error('No items provided or empty array');
    }
    return items.reduce((sum, item) => {
        const price = Number(item.unit_price);
        const qty = Number(item.quantity);
        if (isNaN(price) || isNaN(qty)) {
            throw new Error('Invalid item price or quantity');
        }
        return sum + price * qty;
    }, 0);
}

/**
 * Build the preference payload including dynamic back_urls.
 * @param {number} total - Total amount.
 * @param {string} origin - Request origin (scheme + host).
 * @returns {Object} - Preference payload ready for MercadoPago.
 */
function buildPreferencePayload(total, origin) {
    // Dynamically set back URLs to the root of this same origin
    const backUrls = {
        success: `${origin}/`,
        failure: `${origin}/checkout`,
        pending: `${origin}/`,
    };

    return {
        items: [
            {
                title: 'Total de la compra',
                quantity: 1,
                unit_price: total,
            },
        ],
        back_urls: backUrls,
        auto_return: 'approved',
    };
}

export async function POST(request) {
    try {
        // 1. Parse and validate items from body
        const { items } = await request.json();
        const total = calculateTotal(items);
        console.debug('Calculated cart total:', total);

        // 2. Extract origin from the incoming request URL
        const { origin } = new URL(request.url);
        console.debug('Detected request origin:', origin);

        // 3. Build payload and create preference
        const payload = buildPreferencePayload(total, origin);
        const preferenceResponse = await preferenceClient.create({ body: payload });

        // 4. Return preference ID
        return NextResponse.json({ preferenceId: preferenceResponse.id });
    } catch (error) {
        // Log and return error with debug info
        console.error('MercadoPago Error:', error);
        const message = error instanceof Error ? error.message : String(error);
        return NextResponse.json(
            { error: `Error creating preference: ${message}` },
            { status: 500 }
        );
    }
}
