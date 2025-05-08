// src/app/shop/page.js
// Server component: hereda el layout de /src/app/layout.js

import ProductsGrid from "../components/ProductsGrid";

export default function ShopPage() {
    return (
        <main className="container">
            <ProductsGrid />
        </main>
    );
}
