'use client';

import styles from '../../styles/privacy.module.css';

export default function TermsPage() {
    return (
        <main className={styles.container}>
            <h1 className={styles.title}>TÉRMINOS Y CONDICIONES DE USO</h1>
            <div className={styles.content}>
                <p>
                    <strong>Última actualización:</strong> 18.05.2025
                    <br /><br />

                    Estos Términos y Condiciones regulan el uso del sitio web de NACIONAL y la relación entre los usuarios y el vendedor.
                    Al acceder o utilizar este sitio, aceptás estar sujeto a estas condiciones.
                    <br /><br />

                    <strong>1. Información general</strong><br />
                    Este sitio es propiedad de NACIONAL. Ofrecemos productos para la venta directa, con entrega personal coordinada entre el vendedor y el comprador.
                    <br /><br />

                    <strong>2. Compras</strong><br />
                    Al realizar una compra en este sitio, el usuario declara que es mayor de edad y que toda la información proporcionada es veraz y actual.
                    Una vez confirmado el pago a través de Mercado Pago, se genera un pedido que será coordinado de forma directa para su entrega.
                    <br /><br />

                    <strong>3. Pagos</strong><br />
                    Todos los pagos se procesan de forma segura a través de <strong>Mercado Pago</strong>. El sitio no almacena datos financieros del usuario.
                    <br /><br />

                    <strong>4. Producción y entrega</strong><br />
                    Todas nuestras prendas se hacen a pedido. Trabajamos con procesos artesanales, textiles recuperados y desarrollos específicos para cada pieza.  
                    Una vez realizada la compra, el tiempo estimado de entrega es de <strong>15 días hábiles</strong>.  
                    Las entregas se realizan de forma personalizada y directa entre el vendedor y el comprador. Al confirmar la compra, el usuario acepta este método de entrega y se compromete a coordinarla.
                    <br /><br />

                    <strong>5. Propiedad intelectual</strong><br />
                    Todos los contenidos de este sitio (textos, imágenes, diseño, marcas) son propiedad de NACIONAL o de sus respectivos autores y están protegidos por leyes de propiedad intelectual. No está permitida su reproducción sin autorización.
                    <br /><br />

                    <strong>6. Responsabilidad</strong><br />
                    El sitio no se responsabiliza por demoras o incumplimientos derivados de fuerza mayor o fallas en los servicios externos (por ejemplo, pasarela de pagos o proveedores tecnológicos).
                    <br /><br />

                    <strong>7. Modificaciones</strong><br />
                    NACIONAL se reserva el derecho de modificar estos Términos y Condiciones en cualquier momento. Las versiones actualizadas serán publicadas en esta página con la fecha correspondiente.
                    <br /><br />

                    <strong>8. Datos personales</strong><br />
                    El tratamiento de tus datos personales se realiza conforme a nuestra <a href="/privacidad" className={styles.link}>Política de Privacidad</a>.
                    <br /><br />

                    <strong>9. Legislación aplicable</strong><br />
                    Este sitio opera bajo las leyes de la República Argentina. En caso de conflicto, el usuario acepta someterse a la jurisdicción de los tribunales ordinarios de la Ciudad Autónoma de Buenos Aires.
                    <br /><br />

                    <strong>10. Contacto</strong><br />
                    Para consultas relacionadas con estos Términos y Condiciones, podés escribirnos a:<br />
                    📧 <strong>[tu email]</strong>
                </p>
                <p>Gracias por bancar una forma de producir con sentido y sin apuro.</p>
            </div>
        </main>
    );
}
