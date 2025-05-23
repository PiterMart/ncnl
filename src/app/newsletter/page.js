"use client";

import Form from "@/components/Form";
import styles from "./page.module.css";

export default function NewsletterPage() {
  return (
    <div className={styles.container}>
      <div className={styles.content}>
        <p className={styles.description}>
          Mantenete al día con las últimas noticias, eventos y actualizaciones de NCNL.
          Recibirás información exclusiva directamente en tu bandeja de entrada.
        </p>
        <div className={styles.formContainer}>
          <Form />
        </div>
      </div>
    </div>
  );
}
