"use client";

import { useState, useEffect } from "react";
import validator from "validator";
import styles from "../styles/Form.module.css";

export default function Form() {
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    birthdate: "",
  });

  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const [showForm, setShowForm] = useState(true);

  useEffect(() => {
    let timeout;
    if (submitted) {
      timeout = setTimeout(() => {
        setIsVisible(false);
        setTimeout(() => {
          setShowForm(false);
        }, 500); // Wait for fade-out animation to complete
      }, 5000);
    }
    return () => clearTimeout(timeout);
  }, [submitted]);

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    if (!validator.isEmail(form.email)) {
      setError("El email no es válido.");
      setLoading(false);
      return;
    }

    if (!form.birthdate) {
      setError("Por favor, ingresa tu fecha de nacimiento.");
      setLoading(false);
      return;
    }

    // Calculate age
    const birthDate = new Date(form.birthdate);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }

    if (age < 18) {
      setError("Debes ser mayor de 18 años para registrarte.");
      setLoading(false);
      return;
    }

    if (
      form.firstName.length > 30 ||
      form.lastName.length > 30 ||
      form.email.length > 100
    ) {
      setError("Uno o más campos exceden el límite de caracteres permitido.");
      setLoading(false);
      return;
    }

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      if (res.status === 200) {
        setSubmitted(true);
        setIsVisible(true);
      } else if (res.status === 409) {
        setError("Este correo ya está registrado.");
      } else {
        setError("Ocurrió un error. Intentá más tarde.");
      }
    } catch (err) {
      setError("Ocurrió un error. Intentá más tarde.");
    } finally {
      setLoading(false);
    }
  };

  if (!showForm) {
    return null;
  }

  return submitted ? (
    <div className={`${styles.successMessage} ${isVisible ? styles.visible : styles.hidden}`}>
      ¡Gracias, nos pondremos en contacto!
    </div>
  ) : (
    <form onSubmit={handleSubmit} className={styles.form}>
      <input
        name="firstName"
        placeholder="Nombre"
        value={form.firstName}
        onChange={handleChange}
        maxLength={30}
        required
        className={styles.input}
      />
      <input
        name="lastName"
        placeholder="Apellido"
        value={form.lastName}
        onChange={handleChange}
        maxLength={30}
        required
        className={styles.input}
      />
      <input
        name="email"
        type="email"
        placeholder="Email"
        value={form.email}
        onChange={handleChange}
        maxLength={100}
        required
        className={styles.input}
      />
      <p  style={{ color: "#fff", paddingLeft: "0rem" }}>Fecha de nacimiento:</p>
      <input
        name="birthdate"
        type="date"
        value={form.birthdate}
        onChange={handleChange}
        required
        className={styles.input}
      />
      {error && <div className={styles.error}>{error}</div>}
      <button 
        type="submit" 
        className={styles.submitButton}
        disabled={loading}
      >
        {loading ? "Enviando..." : "Enviar"}
      </button>
    </form>
  );
} 