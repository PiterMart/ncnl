import styles from '../../styles/About.module.css';
import Image from 'next/image';

export default function About() {
    return (
        <div className={styles.about}>
            <div className={styles.aboutContent}>
                {/* <p className={styles.aboutTitle}>NACIONAL</p> */}
                <h1>
                    es una marca argentina que cruza sastrería, streetwear y funcionalidad para crear un lenguaje propio.
                    Cada colección explora nuevas formas de habitar el cuerpo y la ciudad, a través de piezas pensadas para el movimiento y el encuentro.
                </h1>
                <p>
                    Cada colección explora nuevas formas de habitar el cuerpo y la ciudad, a través de piezas pensadas para el movimiento y el encuentro.
                </p>
                <p>
                    Nuestra visión dialoga con los íconos de la sociedad y la estética nacional, tomando inspiración de múltiples universos: la música, las comunidades disidentes, los rituales sociales, el fervor del fútbol, la vida nocturna, las turbulencias políticas, el arte, el amor y la complejidad de los vínculos humanos.
                </p>
                <p style={{ marginTop: '5rem', padding: '1rem', color: 'black' }}>
                    Anclados en una mirada del sur, nos interesa pensar la moda desde Latinoamérica: sus tensiones, sus gestos, su potencia cultural.
                    Trabajamos con textiles recuperados y procesos artesanales. Creemos en una forma de producir con sentido, sin apuro. 
                </p>
            </div>
            <Image src="/aboutpagencnl.jpeg"  className={styles.aboutImage} alt="NCNL About Page Image" width={0} height={0} sizes="100vw" />
        </div>
    )
}