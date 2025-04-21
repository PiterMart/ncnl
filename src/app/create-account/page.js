"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { auth } from "../../../firebase/firebaseConfig";
import { signInWithEmailAndPassword } from "firebase/auth";
import styles from "../../styles/CreateAccount.module.css";

export default function CreateAccount() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [userName, setUserName] = useState("");

  useEffect(() => {
    if (!token) {
      setError("Token no válido o expirado");
      return;
    }

    // Fetch lead data to get the user's name
    const fetchLeadData = async () => {
      try {
        const res = await fetch(`/api/leads?token=${token}`);
        const data = await res.json();
        
        if (res.ok && data.lead) {
          setUserName(data.lead.name);
        }
      } catch (err) {
        console.error('Error fetching lead data:', err);
      }
    };

    fetchLeadData();
  }, [token]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    if (password !== confirmPassword) {
      setError("Las contraseñas no coinciden");
      setLoading(false);
      return;
    }

    if (password.length < 6) {
      setError("La contraseña debe tener al menos 6 caracteres");
      setLoading(false);
      return;
    }

    try {
      const res = await fetch("/api/create-account", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ token, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Error al crear la cuenta");
      }

      // Sign in the user automatically
      await signInWithEmailAndPassword(auth, data.email, password);
      
      setSuccess(true);
      // Redirect to home page after 2 seconds
      setTimeout(() => {
        router.push("/");
      }, 2000);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (!token) {
    return (
      <div className={styles.container}>
        <h1 className={styles.title}>Error</h1>
        <p className={styles.error}>{error}</p>
        <button 
          className={styles.button}
          onClick={() => router.push("/")}
        >
          Volver al inicio
        </button>
      </div>
    );
  }

  if (success) {
    return (
      <div className={styles.container}>
        <h1 className={styles.title}>¡Cuenta creada con éxito!</h1>
        <p className={styles.success}>
          Serás redirigido a la página principal en unos segundos...
        </p>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>¡Hola {userName}!</h1>
      <p className={styles.subtitle}>
        Establece una contraseña para tu cuenta
      </p>
      <form onSubmit={handleSubmit} className={styles.form}>
        <div className={styles.inputGroup}>
          <label htmlFor="password">Contraseña</label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={6}
            className={styles.input}
          />
        </div>
        <div className={styles.inputGroup}>
          <label htmlFor="confirmPassword">Confirmar contraseña</label>
          <input
            id="confirmPassword"
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            minLength={6}
            className={styles.input}
          />
        </div>
        {error && <p className={styles.error}>{error}</p>}
        <button
          type="submit"
          className={styles.button}
          disabled={loading}
        >
          {loading ? "Creando cuenta..." : "Crear cuenta"}
        </button>
      </form>
    </div>
  );
} 