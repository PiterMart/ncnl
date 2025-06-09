import styles from '../../styles/About.module.css';
import Image from 'next/image';

export default function About() {
    return (
        <div className={styles.about}>
            <Image src="/aboutpagencnl2.jpg"  className={styles.aboutImage} alt="NCNL About Page Image" width={0} height={0} sizes="100vw" />
            <div className={styles.aboutContent}>
                <h1>
                    NCNL es una marca argentina que cruza sastrería, streetwear y funcionalidad para crear un lenguaje propio.
                    Cada colección explora nuevas formas de habitar el cuerpo y la ciudad, a través de piezas pensadas para el movimiento y el encuentro.
                </h1>
                <p>
                    Nuestra visión dialoga con los íconos de la sociedad y la estética nacional, tomando inspiración de múltiples universos: la música, las comunidades disidentes, los rituales sociales, el fervor del fútbol, la vida nocturna, las turbulencias políticas, el arte, el amor y la complejidad de los vínculos humanos.
                </p>
                <Image src="/aboutpagencnl.jpeg"  className={styles.aboutImage} alt="NCNL About Page Image" width={0} height={0} sizes="100vw" />
                <p style={{ marginTop: '10rem' }}>
                    Anclados en una mirada del sur, nos interesa pensar la moda desde Latinoamérica: sus tensiones, sus gestos, su potencia cultural.
                    Trabajamos con textiles recuperados y procesos artesanales. Creemos en una forma de producir con sentido, sin apuro.
                </p>
            </div>
        </div>
    )
}