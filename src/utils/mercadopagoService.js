// src/utils/mercadopagoService.js

export async function createPreference(preferencePayload) {
    const response = await fetch('/api/mercadopago', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(preferencePayload),
    });

    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`MercadoPago fetch error: ${errorText}`);
    }

    const data = await response.json();
    console.log('MercadoPago response:', data);
    return data.preferenceId;
}
