// src/components/ProductsGrid.js
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import styles from "../styles/ProductsGrid.module.css";
import { productService } from "@/services/productService";
import ProductImage from "./ProductImage";
import { formatPrice } from "../utils/priceUtils";
import React from "react"; // Added missing import for React.Fragment

export default function ProductsGrid({ onProductsLoaded }) {
    const [products, setProducts] = useState([]);
    const [error, setError] = useState("");
    const [selectedCategory, setSelectedCategory] = useState("");
    const [hoveredProduct, setHoveredProduct] = useState(null);

    useEffect(() => {
        // Subscribe to product updates
        const unsubscribe = productService.subscribeToProducts(
            (snapshot) => {
                setProducts(snapshot);
                onProductsLoaded?.(); // Notify parent when data arrives
            },
            (err) => {
                console.error("Error loading products:", err);
                setError("No se pudieron cargar los productos.");
                onProductsLoaded?.(); // Notify parent even on error
            }
        );
        return () => unsubscribe();
    }, [onProductsLoaded]);

    const categories = [
        "Campera", "Chaleco", "Accesorios", "Botas", "Pantalon", 
        "Camisa", "Buzo", "Remera"
    ];

    // Custom sorting function for products
    const sortProducts = (products) => {
        const categoryPriority = [
            "Campera", "Chaleco", "Accesorios", "Botas", "Pantalon", 
            "Camisa", "Buzo", "Remera"
        ];

        const productPriorityOrder = [
            "SANTO NEGRO", 
            "LA BESTIA",
            "EL SILENCIO",
            "PASTOR TECH"
        ];

        return [...products].sort((a, b) => {
            // Map categories for sorting (group Morral and Gorra under Accesorios)
            const getSortCategory = (category) => {
                if (category === "Morral" || category === "Gorra") return "Accesorios";
                return category;
            };

            const aSortCategory = getSortCategory(a.category);
            const bSortCategory = getSortCategory(b.category);

            // Get category priority indices
            const aCategoryIndex = categoryPriority.indexOf(aSortCategory);
            const bCategoryIndex = categoryPriority.indexOf(bSortCategory);
            
            // If categories are different, sort by category priority
            if (aCategoryIndex !== bCategoryIndex) {
                // If category not found in priority list, put it at the end
                if (aCategoryIndex === -1 && bCategoryIndex === -1) {
                    return aSortCategory.localeCompare(bSortCategory);
                }
                if (aCategoryIndex === -1) return 1;
                if (bCategoryIndex === -1) return -1;
                return aCategoryIndex - bCategoryIndex;
            }
            
            // If both products are in the same category, apply product-specific sorting
            if (aSortCategory === "Campera" && bSortCategory === "Campera") {
                // Try exact match first
                let aIndex = productPriorityOrder.indexOf(a.name);
                let bIndex = productPriorityOrder.indexOf(b.name);
                
                // If exact match fails, try partial match (case insensitive)
                if (aIndex === -1) {
                    aIndex = productPriorityOrder.findIndex(priority => 
                        a.name.toLowerCase().includes(priority.toLowerCase())
                    );
                }
                if (bIndex === -1) {
                    bIndex = productPriorityOrder.findIndex(priority => 
                        b.name.toLowerCase().includes(priority.toLowerCase())
                    );
                }
                
                // If both are in priority order, sort by their position
                if (aIndex !== -1 && bIndex !== -1) {
                    return aIndex - bIndex;
                }
                
                // If only one is in priority order, prioritize it
                if (aIndex !== -1 && bIndex === -1) return -1;
                if (aIndex === -1 && bIndex !== -1) return 1;
                
                // If neither is in priority order, sort alphabetically
                return a.name.localeCompare(b.name);
            }
            
            // For other categories, sort alphabetically by name
            return a.name.localeCompare(b.name);
        });
    };

    const filteredProducts = selectedCategory
        ? products.filter(p => {
            if (selectedCategory === "Accesorios") {
                return p.category === "Morral" || p.category === "Gorra";
            }
            return p.category === selectedCategory;
        })
        : sortProducts(products);

    // Group products by category for section display
    const groupedProducts = {};
    filteredProducts.forEach(product => {
        // Map categories for display (group Morral and Gorra under Accesorios)
        let displayCategory = product.category;
        if (product.category === "Morral" || product.category === "Gorra") {
            displayCategory = "Accesorios";
        }
        
        if (!groupedProducts[displayCategory]) {
            groupedProducts[displayCategory] = [];
        }
        groupedProducts[displayCategory].push(product);
    });

    // Category display titles with plurals
    const categoryDisplayTitles = {
        "Campera": "Camperas",
        "Chaleco": "Chalecos", 
        "Accesorios": "Accesorios",
        "Botas": "Botas",
        "Pantalon": "Pantalones",
        "Camisa": "Camisas",
        "Buzo": "Buzos",
        "Remera": "Remeras"
    };

    // Debug: Log the final sorted order
    // console.log("Final sorted products:", filteredProducts.map(p => `${p.name} (${p.category})`));

    if (error) {
        return <p className={styles.errorText}>{error}</p>;
    }

    if (products.length === 0) {
        return <p>No hay productos disponibles.</p>;
    }

    return (
        <div className={styles.container}>
            <div className={styles.filterContainer}>
                <div className={styles.categoryFilters}>
                    <span 
                        className={`${styles.categoryFilter} ${selectedCategory === "" ? styles.active : ""}`}
                        onClick={() => setSelectedCategory("")}
                    >
                        TODO
                    </span>
                    {Object.keys(categoryDisplayTitles).map((category, index) => (
                        <React.Fragment key={category}>
                            <span className={styles.separator}> | </span>
                            <span 
                                className={`${styles.categoryFilter} ${selectedCategory === category ? styles.active : ""}`}
                                onClick={() => setSelectedCategory(category)}
                            >
                                {categoryDisplayTitles[category]}
                            </span>
                        </React.Fragment>
                    ))}
                </div>
            </div>
            
            {Object.entries(groupedProducts).map(([category, categoryProducts]) => (
                <div key={category} className={styles.categorySection}>
                    <h2 className={styles.categoryTitle}>{categoryDisplayTitles[category] || category}</h2>
                    <div className={styles.grid}>
                        {categoryProducts.map((p) => (
                            <Link
                                href={`/shop/${p.id}`}
                                key={p.id}
                                className={styles.card}
                                onMouseEnter={() => setHoveredProduct(p.id)}
                                onMouseLeave={() => setHoveredProduct(null)}
                            >
                                <div className={styles.imageContainer}>
                                    {p.images?.[0] && (
                                        <ProductImage
                                            src={p.images[0]}
                                            alt={p.name}
                                            className={styles.image}
                                            style={{
                                                opacity: hoveredProduct === p.id ? 0 : 1,
                                                transition: 'opacity 0.3s ease-in-out'
                                            }}
                                        />
                                    )}
                                    {p.images?.[1] && (
                                        <ProductImage
                                            src={p.images[1]}
                                            alt={p.name}
                                            className={styles.image}
                                            useContainer={false}
                                            style={{
                                                position: 'absolute',
                                                top: 0,
                                                left: 0,
                                                opacity: hoveredProduct === p.id ? 1 : 0,
                                                transition: 'opacity 0.3s ease-in-out',
                                                zIndex: 1
                                            }}
                                        />
                                    )}
                                </div>
                                <div className={styles.textContainer}>
                                    <p className={styles.name} style={{ top: '-1.5rem', position: 'absolute', transform: 'none' }}>{p.category}</p>
                                    <h2 className={styles.name} style={{ top: '-0.25rem', position: 'absolute' }}>{p.name}</h2>
                                    {/* Apply localized formatting */}
                                    <p className={styles.price} style={{ top: '1.25rem', position: 'absolute' }}>
                                        ${formatPrice(p.price)}
                                    </p>
                                </div>
                            </Link> 
                        ))}
                    </div>
                </div>
            ))}
        </div>
    );
}
