import { MercadoPagoConfig, Preference } from 'mercadopago';
import { NextResponse } from 'next/server';

const client = new MercadoPagoConfig({
    accessToken: "APP_USR-4097106721723679-052015-3b709477eef03b47f1a93213f16a7ed7-108676363",
    options: { timeout: 10000 },
});

const preferenceClient = new Preference(client);

export async function POST(request) {
    try {
        const { items, back_urls, auto_return } = await request.json();

        // Validaciones mínimas
        if (!Array.isArray(items) || items.length === 0) {
            return NextResponse.json(
                { error: 'No items provided or empty array' },
                { status: 400 }
            );
        }

        if (!back_urls?.success) {
            return NextResponse.json(
                { error: 'back_urls.success is missing' },
                { status: 400 }
            );
        }

        const preferencePayload = {
            items,
            back_urls,
            ...(back_urls.success.startsWith("https://") && { auto_return }),
        };

        console.debug("Payload enviado a MP:", preferencePayload);

        const preferenceResponse = await preferenceClient.create({
            body: preferencePayload,
        });

        return NextResponse.json({ preferenceId: preferenceResponse.id });
    } catch (error) {
        console.error("MercadoPago Error:", error);
        return NextResponse.json(
            { error: `Error creating preference: ${error.message}` },
            { status: 500 }
        );
    }
}
