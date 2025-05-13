// src/app/api/mercadopago/route.js
import { MercadoPagoConfig, Preference } from 'mercadopago';
import { NextResponse } from 'next/server';

// Initialize MercadoPago client with access token
const client = new MercadoPagoConfig({
    accessToken: "APP_USR-3457585408128452-051019-8b5c6dab85c5f31cfe67af3841ddad8e-201404516",
    // Optional: request timeout in ms
    options: { timeout: 10000 },
});

// Instantiate Preference API
const preferenceClient = new Preference(client);

export async function POST(request) {
    try {
        // Parse request body
        const { items } = await request.json();

        // Validate items array
        if (!items || !Array.isArray(items) || items.length === 0) {
            return NextResponse.json(
                { error: 'No items provided or empty array' },
                { status: 400 }
            );
        }

        // Prepare preference payload
        const body = {
            items: [
                {
                    title: 'Mi producto',
                    quantity: 1,
                    unit_price: 2000
                }
            ],
            back_urls: {
                success: 'https://www.tu-sitio/success',
                failure: 'https://www.tu-sitio/failure',
                pending: 'https://www.tu-sitio/pending',
            },
            auto_return: 'approved',
        };

        // Create preference
        const preferenceResponse = await preferenceClient.create({ body });

        // Return preference ID
        return NextResponse.json({ preferenceId: preferenceResponse.id });
    } catch (error) {
        // Log error and return message
        console.error('MercadoPago Error:', error);
        const message = error.message || JSON.stringify(error);
        return NextResponse.json(
            { error: `Error creating preference: ${message}` },
            { status: 500 }
        );
    }
}
