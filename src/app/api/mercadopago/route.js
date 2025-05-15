import { MercadoPagoConfig, Preference } from 'mercadopago';
import { NextResponse } from 'next/server';

// Initialize MercadoPago client with access token
const client = new MercadoPagoConfig({
    accessToken: "APP_USR-3457585408128452-051019-8b5c6dab85c5f31cfe67af3841ddad8e-201404516",
    options: { timeout: 10000 },
});

// Instantiate Preference API
const preferenceClient = new Preference(client);

export async function POST(request) {
    try {
        // Parse request body and validate
        const { items } = await request.json();
        if (!items || !Array.isArray(items) || items.length === 0) {
            return NextResponse.json(
                { error: 'No items provided or empty array' },
                { status: 400 }
            );
        }

        // Calculate total amount from cart items
        const total = items.reduce((sum, item) => {
            // Ensure price and quantity are numbers
            const price = Number(item.unit_price);
            const qty = Number(item.quantity);
            return sum + price * qty;
        }, 0);

        console.debug('Calculated cart total:', total);

        // Prepare preference payload with a single item for the whole cart
        const preferencePayload = {
            items: [
                {
                    title: 'Total de la compra',
                    quantity: 1,
                    unit_price: total,
                }
            ],
            back_urls: {
                success: 'https://www.ncnl.co/',
                failure: 'https://www.ncnl.co/',
                pending: 'https://www.ncnl.co/',
            },
            auto_return: 'approved',
        };

        // Create preference on MercadoPago
        const preferenceResponse = await preferenceClient.create({ body: preferencePayload });

        // Return preference ID to the client
        return NextResponse.json({ preferenceId: preferenceResponse.id });
    } catch (error) {
        // Log and return error
        console.error('MercadoPago Error:', error);
        const message = error.message || JSON.stringify(error);
        return NextResponse.json(
            { error: `Error creating preference: ${message}` },
            { status: 500 }
        );
    }
}
