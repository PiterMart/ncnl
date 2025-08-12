'use client';

import { CartProvider } from "../../contexts/CartContext";
import Navbar from "./Navbar";
import Footer from "./Footer";
import BackgroundMusic from "./BackgroundMusic";

export default function ClientLayout({ children }) {
  return (
    <CartProvider>
      <Navbar />
      <div className="min-h-screen flex flex-col">
        <main className="flex-grow">{children}</main>
        <Footer />
      </div>
      <BackgroundMusic />
    </CartProvider>
  );
} 