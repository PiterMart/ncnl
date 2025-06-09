'use client';

import styles from '../../styles/privacy.module.css';

export default function PrivacyPolicyPage() {
    return (
        <main className={styles.container}>
            <h1 className={styles.title}>POLÍTICA DE PRIVACIDAD</h1>
            <div className={styles.content}>
                <p>
                    <strong>Última actualización:</strong> [18.05.2025]
                    <br /><br />
                    En NACIONAL respetamos tu privacidad y protegemos tus datos personales conforme a la Ley N.º 25.326 de Protección de los Datos Personales de la República Argentina. Esta política explica cómo recopilamos, usamos y protegemos tu información.
                    <br /><br />
                    <strong>1. ¿Qué datos recolectamos?</strong>
                    <br />
                    Cuando realizás una compra o nos contactás, podemos recopilar los siguientes datos:
                    <br />
                    - Nombre y apellido<br />
                    - Dirección de correo electrónico<br />
                    - Número de teléfono<br />
                    - Localidad o zona de entrega<br />
                    - Información sobre tus pedidos
                    <br /><br />
                    <em>No almacenamos datos financieros.</em> Los pagos se procesan de forma segura a través de Mercado Pago.
                    <br /><br />
                    <strong>2. ¿Para qué usamos tus datos?</strong>
                    <br />
                    Usamos tus datos únicamente para:
                    <br />
                    - Procesar y gestionar tus pedidos<br />
                    - Coordinar la entrega<br />
                    - Enviarte confirmaciones y actualizaciones sobre tu compra<br />
                    - Comunicarnos en caso de ser necesario<br />
                    - Mejorar nuestros servicios
                    <br /><br />
                    <strong>3. ¿Compartimos tu información?</strong>
                    <br />
                    No vendemos, alquilamos ni compartimos tus datos personales con terceros, excepto cuando:
                    <br />
                    - Sea necesario para cumplir con una obligación legal<br />
                    - Lo exija una orden judicial<br />
                    - Utilicemos herramientas de terceros para el funcionamiento del sitio (como Mercado Pago o proveedores de hosting), que también se comprometen a proteger tu información
                    <br /><br />
                    <strong>4. Seguridad</strong>
                    <br />
                    Implementamos medidas técnicas y organizativas razonables para proteger tus datos personales frente a accesos no autorizados, pérdida o destrucción.
                    <br /><br />
                    <strong>5. Derechos del usuario</strong>
                    <br />
                    Como titular de tus datos, tenés derecho a:
                    <br />
                    - Acceder a tu información<br />
                    - Solicitar su corrección, actualización o eliminación<br />
                    - Retirar tu consentimiento<br />
                    - Oponerte al tratamiento de tus datos en ciertos casos
                    <br />
                    Podés ejercer estos derechos escribiéndonos a: <strong>[tu email]</strong>
                    <br /><br />
                    <strong>6. Cookies</strong>
                    <br />
                    Este sitio puede utilizar cookies técnicas y de análisis para mejorar la experiencia de navegación. No se usan cookies para publicidad ni para recolectar datos sensibles.
                    <br /><br />
                    <strong>7. Transferencia internacional de datos</strong>
                    <br />
                    En caso de que utilicemos servicios de terceros ubicados fuera de Argentina (como servidores o procesadores de pagos), nos aseguraremos de que cumplan con estándares adecuados de protección de datos.
                    <br /><br />
                    <strong>8. Cambios en esta política</strong>
                    <br />
                    Podemos actualizar esta Política de Privacidad en cualquier momento. Publicaremos la versión actualizada en esta página con la fecha de revisión.
                    <br /><br />
                    <strong>9. Contacto</strong>
                    <br />
                        Para consultas o reclamos relacionados con el uso de tus datos personales.<br />
                        Podés escribirnos al mail <strong><a href="mailto:contact@ncnl.co">contact@ncnl.co</a></strong> o al Instagram <strong><a href="https://www.instagram.com/ncnl.co" target="_blank" rel="noopener noreferrer">ncnl.co</a></strong> y te respondemos lo antes posible.
                    <br /><br />
                    <strong>Autoridad de Control:</strong> La Agencia de Acceso a la Información Pública, órgano de control de la Ley N.º 25.326, tiene la facultad de atender denuncias y reclamos vinculados con el incumplimiento de las normas sobre protección de datos personales. Más información en: <a href="https://www.argentina.gob.ar/aaip" target="_blank">https://www.argentina.gob.ar/aaip</a>
                </p>
            </div>
        </main>
    );
}
