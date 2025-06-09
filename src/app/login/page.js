"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { signInWithEmailAndPassword, onAuthStateChanged } from "firebase/auth";
import { auth } from "../../../firebase/firebaseConfig";
import styles from "../../styles/Login.module.css";

export default function Login() {
  const router = useRouter();
  const [form, setForm] = useState({
    email: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    let mounted = true;
    console.log("Setting up auth state listener");

    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (!mounted) return;
      
      console.log("Auth state changed:", user ? "User logged in" : "No user");
      setIsInitialized(true);
      
      if (user) {
        console.log("Redirecting to admin page");
        setLoading(false);
        router.push('/');
      }
    });

    return () => {
      console.log("Cleaning up auth listener");
      mounted = false;
      unsubscribe();
    };
  }, [router]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    console.log("Attempting login with:", form.email);

    try {
      if (!isInitialized) {
        throw new Error("Authentication system is not ready");
      }

      const userCredential = await signInWithEmailAndPassword(auth, form.email, form.password);
      console.log("Login successful:", userCredential.user.email);
      
      if (userCredential.user) {
        // Don't redirect here, let the auth state listener handle it
        setLoading(false);
      }
    } catch (err) {
      console.error("Login error:", err);
      setLoading(false);
      
      if (err.message === "Authentication system is not ready") {
        setError("El sistema de autenticación no está listo. Por favor, recargue la página.");
      } else {
        setError(
          err.code === "auth/wrong-password" || err.code === "auth/user-not-found"
            ? "Email o contraseña incorrectos"
            : err.code === "auth/too-many-requests"
            ? "Demasiados intentos. Por favor, intente más tarde."
            : "Error al iniciar sesión. Por favor, intente nuevamente."
        );
      }
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.form}>
        <h2 className={styles.title}>Iniciar Sesión</h2>
        <form onSubmit={handleSubmit}>
          <div>
            <label htmlFor="email" className="sr-only">Email</label>
            <input
              id="email"
              name="email"
              type="email"
              required
              className={styles.input}
              placeholder="Email"
              value={form.email}
              onChange={handleChange}
            />
          </div>
          <div>
            <label htmlFor="password" className="sr-only">Contraseña</label>
            <input
              id="password"
              name="password"
              type="password"
              required
              className={styles.input}
              placeholder="Contraseña"
              value={form.password}
              onChange={handleChange}
            />
          </div>
          {error && <div className={styles.error}>{error}</div>}
          <button
            type="submit"
            className={styles.button}
            disabled={loading}
          >
            {loading ? "Iniciando sesión..." : "Iniciar sesión"}
          </button>
        </form>
      </div>
    </div>
  );
} 