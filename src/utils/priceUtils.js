/**
 * Formats a numeric price into a string with thousands separators (.)
 * and decimal comma (,) according to es-AR locale.
 * @param {string|number} value - The price to format.
 * @returns {string} - Formatted price string.
 */
export function formatPrice(value) {
    try {
        const number = Number(value);
        if (isNaN(number)) {
            // throw new Error(`Invalid price value: ${value}`);
        }
        return new Intl.NumberFormat('es-AR', {
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
        }).format(number);
    } catch (error) {
        console.error('Error formatting price:', error);
        // Fallback to raw value
        return String(value);
    }
} 