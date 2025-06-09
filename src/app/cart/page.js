// src/app/cart/page.js
"use client";

import CartList from "../../components/CartList";
import styles from "../../styles/CartPage.module.css";

export default function CartPage() {
    return (
        <div className={styles.pageContainer}>
            <CartList />
        </div>
    );
}
