"use client";

import { useState } from "react";
import validator from "validator";
import styles from "../styles/ContactForm.module.css";

export default function ContactForm() {
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    birthdate: "",
  });

  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState(null);

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (!validator.isEmail(form.email)) {
      setError("El email no es válido.");
      return;
    }

    if (!form.birthdate) {
      setError("Por favor, ingresa tu fecha de nacimiento.");
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
      return;
    }

    if (
      form.firstName.length > 30 ||
      form.lastName.length > 30 ||
      form.email.length > 100
    ) {
      setError("Uno o más campos exceden el límite de caracteres permitido.");
      return;
    }

    const res = await fetch("/api/contact", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });

    if (res.status === 200) {
      setSubmitted(true);
    } else if (res.status === 409) {
      setError("Este correo ya está registrado.");
    } else {
      setError("Ocurrió un error. Intentá más tarde.");
    }
  };

  return submitted ? (
    <div className={styles.gracias}>¡Gracias por sumarte!</div>
  ) : (
    <form onSubmit={handleSubmit} className={styles.formulario}>
      <input
        name="firstName"
        placeholder="Nombre"
        value={form.firstName}
        onChange={handleChange}
        maxLength={30}
        required
      />
      <input
        name="lastName"
        placeholder="Apellido"
        value={form.lastName}
        onChange={handleChange}
        maxLength={30}
        required
      />
      <input
        name="email"
        type="email"
        placeholder="Email"
        value={form.email}
        onChange={handleChange}
        maxLength={100}
        required
      />
      <input
        name="birthdate"
        type="date"
        value={form.birthdate}
        onChange={handleChange}
        required
        className={styles.dateInput}
      />
      {error && <div className={styles.error}>{error}</div>}
      <button type="submit" className={styles.submit}>
        Enviar
      </button>
    </form>
  );
} 