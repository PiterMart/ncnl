'use client';

import { CartProvider } from "../../contexts/CartContext";

export default function ClientLayout({ children }) {
  return (
    <CartProvider>
      <div className="min-h-screen flex flex-col">
        <main className="flex-grow">{children}</main>
      </div>
    </CartProvider>
  );
} 