/**
 * Determines if a product is sold out based on stock availability or price.
 * For new products with stock fields (stock1, stock2, stock3), checks total stock.
 * For old products without stock fields, falls back to price-based check.
 * @param {object} product - The product object
 * @returns {boolean} - True if product is sold out, false otherwise
 */
export function isProductSoldOut(product) {
    // Check if product has stock fields (new products with stock control)
    if (
        product.stock1 !== undefined ||
        product.stock2 !== undefined ||
        product.stock3 !== undefined
    ) {
        // New product with stock control - check total stock
        const stock1 = Number(product.stock1) || 0;
        const stock2 = Number(product.stock2) || 0;
        const stock3 = Number(product.stock3) || 0;
        const totalStock = stock1 + stock2 + stock3;
        return totalStock <= 0;
    } else {
        // Old product without stock fields - use price-based check
        const price = product.price;
        const numPrice = Number(price);
        return isNaN(numPrice) || price === "SOLD OUT";
    }
}

