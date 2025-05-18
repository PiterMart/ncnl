'use client';

import styles from '../../styles/privacy.module.css';

export default function HelpPage() {
    return (
        <main className={styles.container}>
            <h1 className={styles.title}>AYUDA / PREGUNTAS FRECUENTES</h1>
            <div className={styles.content}>
                <p>
                    <strong>¿Cómo realizo una compra?</strong><br />
                    Seleccioná el producto que querés, hacé clic en “Comprar” y seguí los pasos para confirmar tu pedido. Luego vas a ser redirigido a Mercado Pago para realizar el pago de forma segura.
                    <br /><br />

                    <strong>¿Qué medios de pago aceptan?</strong><br />
                    Todos los métodos que permite Mercado Pago: tarjetas de débito, crédito, transferencias y efectivo en puntos de pago habilitados como Rapipago o Pago Fácil.
                    <br /><br />

                    <strong>¿Cómo se coordina la entrega?</strong><br />
                    Una vez realizado y confirmado el pago, nos pondremos en contacto con vos por mail o WhatsApp para coordinar una entrega personalizada. No usamos servicios de correo tradicionales.
                    <br /><br />

                    <strong>¿Dónde entregan?</strong><br />
                    Por el momento, las entregas se realizan dentro de [tu zona/localidad]. En caso de estar fuera de ese radio, escribinos antes de realizar tu compra para ver si podemos coordinar.
                    <br /><br />

                    <strong>¿Necesito crear una cuenta para comprar?</strong><br />
                    No. Podés realizar tu compra como invitado. Solo necesitás dejar tus datos para poder contactarte y coordinar la entrega.
                    <br /><br />

                    <strong>¿Puedo cancelar o modificar un pedido?</strong><br />
                    Si aún no realizaste el pago, podés cancelar sin problema. Si ya lo pagaste, contactanos lo antes posible para ver si es posible hacer un cambio o devolución.
                    <br /><br />

                    <strong>¿Cómo sé que mi pedido está confirmado?</strong><br />
                    Vas a recibir un mail de confirmación luego del pago, y después nos comunicaremos con vos para coordinar la entrega.
                    <br /><br />

                    <strong>¿Tienen atención al cliente?</strong><br />
                    Sí. Podés escribirnos a 📧 <strong>[tu email]</strong> o por Instagram <strong>@nacional</strong> y te respondemos lo antes posible.
                    <br /><br />

                    <strong>¿Dónde puedo ver los Términos y Condiciones?</strong><br />
                    Podés consultarlos en <a href="/terminos-y-condiciones" className={styles.link}>Términos y Condiciones</a> y <a href="/politica-de-privacidad" className={styles.link}>Política de Privacidad</a>.
                </p>
            </div>
        </main>
    );
}
