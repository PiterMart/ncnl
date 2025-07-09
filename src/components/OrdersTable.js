// src/components/OrdersTable.js
"use client";

import React, { useState, useEffect } from "react";
import styles from "../styles/OrdersTable.module.css";
import { orderService } from "../services/orderService";

// Possible statuses for orders
const statusOptions = ["pending", "paid", "cancelled", "refunded"];

function Modal({ isOpen, onClose, children }) {
    if (!isOpen) return null;
    return (
        <div className={styles.modalOverlay} onClick={onClose}>
            <div className={styles.modalContent} onClick={e => e.stopPropagation()}>
                <button className={styles.closeButton} onClick={onClose}>
                    &times;
                </button>
                {children}
            </div>
        </div>
    );
}

export default function OrdersTable() {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedOrder, setSelectedOrder] = useState(null);

    // Subscribe in real time to 'orders' collection
    useEffect(() => {
        const unsubscribe = orderService.subscribeToOrders(
            snapshot => {
                const list = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
                setOrders(list);
                setLoading(false);
            },
            err => {
                console.error("Error subscribing to orders:", err);
                setError("No se pudo cargar los pedidos");
                setLoading(false);
            }
        );
        return () => unsubscribe();
    }, []);

    // Open detail modal
    const handleOpenModal = order => {
        setSelectedOrder(order);
        setIsModalOpen(true);
    };

    // Close detail modal
    const handleCloseModal = () => {
        setIsModalOpen(false);
        setSelectedOrder(null);
    };

    // Delete order after user confirmation
    const handleDeleteOrder = async orderId => {
        const confirmed = window.confirm("¿Estás seguro que querés eliminar esta orden?");
        if (!confirmed) return;

        try {
            await orderService.deleteOrder(orderId);
        } catch (err) {
            console.error("Error deleting order:", err);
            alert("No se pudo eliminar la orden.");
        }
    };

    // Change order status via dropdown
    const handleStatusChange = async (orderId, newStatus) => {
        // Update UI immediately
        setOrders(prev =>
            prev.map(o => (o.id === orderId ? { ...o, status: newStatus } : o))
        );

        try {
            // Persist status change
            await orderService.updateOrderStatus(orderId, newStatus);
            console.debug("Order status updated:", orderId, newStatus);
        } catch (err) {
            console.error("Error updating order status:", err);
            alert("No se pudo actualizar el estado de la orden.");
        }
    };

    if (loading) {
        return <div className={styles.loading}>Cargando pedidos…</div>;
    }

    if (error) {
        return <div className={styles.error}>{error}</div>;
    }

    return (
        <div className={styles.tableContainer}>
            <h2>Pedidos</h2>
            <table className={styles.table}>
                <thead>
                    <tr>
                        <th>ID Pedido</th>
                        <th>Cliente</th>
                        <th>Email</th>
                        <th>Items</th>
                        <th>Total</th>
                        <th>Fecha</th>
                        <th>Estado</th> {/* New column */}
                        <th>Acciones</th>
                    </tr>
                </thead>
                <tbody>
                    {orders.map(order => (
                        <tr key={order.id}>
                            <td>{order.id}</td>
                            <td>{order.customer?.name || "-"}</td>
                            <td>{order.customer?.email || "-"}</td>
                            <td>{Array.isArray(order.items) ? order.items.length : "-"}</td>
                            <td>${order.total?.toFixed(2) ?? "-"}</td>
                            <td>
                                {order.createdAt
                                    ? new Date(order.createdAt.seconds * 1000).toLocaleString()
                                    : "-"}
                            </td>
                            {/* Status dropdown */}
                            <td>
                                <select
                                    value={order.status || ""}
                                    onChange={e => handleStatusChange(order.id, e.target.value)}
                                    className={styles.statusSelect}
                                >
                                    {statusOptions.map(status => (
                                        <option key={status} value={status}>
                                            {status}
                                        </option>
                                    ))}
                                </select>
                            </td>
                            <td className={styles.actionCell}>
                                <button
                                    className={styles.detailButton}
                                    onClick={() => handleOpenModal(order)}
                                >
                                    Ver Detalles
                                </button>
                                <button
                                    className={styles.deleteButton}
                                    onClick={() => handleDeleteOrder(order.id)}
                                >
                                    Eliminar
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>

            {orders.length === 0 && (
                <div className={styles.emptyMessage}>No hay pedidos para mostrar</div>
            )}

            <Modal isOpen={isModalOpen} onClose={handleCloseModal}>
                {selectedOrder && (
                    <div className={styles.modalContent} style={{ padding: '1rem' }}>
                        <h3>Detalle Pedido: {selectedOrder.id}</h3>
                        <p><strong>Cliente:</strong> {selectedOrder.customer.name}</p>
                        <p><strong>Email:</strong> {selectedOrder.customer.email}</p>
                        <p><strong>Tel:</strong> {selectedOrder.customer.phone}</p>
                        <p><strong>Dirección:</strong> {[
                            selectedOrder.customer.address,
                            selectedOrder.customer.city,
                            selectedOrder.customer.province,
                            selectedOrder.customer.country,
                            "CP " + selectedOrder.customer.postalCode
                        ].filter(Boolean).join(", ")}</p>
                        <h4>Items:</h4>
                        <ul>
                            {selectedOrder.items.map((i, idx) => (
                                <li key={idx}>
                                    {i.category} {i.name} TALLE: {i.size} x {i.quantity} — ${(i.price * i.quantity).toFixed(2)}
                                </li>
                            ))}
                        </ul>
                        <p><strong>Total:</strong> ${selectedOrder.total.toFixed(2)}</p>
                        {selectedOrder.status && (
                            <p><strong>Status:</strong> {selectedOrder.status}</p>
                        )}
                    </div>
                )}
            </Modal>
        </div>
    );
}
