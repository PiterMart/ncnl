import styles from '../../styles/About.module.css';
import Image from 'next/image';
import Link from 'next/link';

export default function About() {
    return (
        <div className={styles.about}>
            <div className={styles.aboutContent}>
                {/* <p className={styles.aboutTitle}>NACIONAL</p> */}
                <h1>
                    es una marca argentina que cruza sastrería, streetwear y funcionalidad para crear un lenguaje propio.
                </h1>
                <p style={{textAlign: 'right' , maxWidth: '438px'}}>
                    Cada colección explora nuevas formas de habitar el cuerpo y la ciudad, a través de piezas pensadas para el movimiento y el encuentro.
                </p>
                <p style={{ marginTop: '3rem', padding: '1rem', color: 'black', textAlign: 'justify' }}>
                    Anclados en una mirada del sur, nos interesa pensar la moda desde Latinoamérica: sus tensiones, sus gestos, su potencia cultural.
                    Trabajamos con textiles recuperados y procesos artesanales. Creemos en una forma de producir con sentido, sin apuro. 
                    <br />
                    <br />
                    Nuestra visión dialoga con los íconos de la sociedad y la estética nacional, tomando inspiración de múltiples universos: la música, las comunidades disidentes, los rituales sociales, el fervor del fútbol, la vida nocturna, las turbulencias políticas, el arte, el amor y la complejidad de los vínculos humanos.
                </p>
            </div>
            <div className={styles.imageContainer}>
                <Image src="/aboutpagencnl.jpeg"  className={styles.aboutImage} alt="NCNL About Page Image" width={0} height={0} sizes="100vw" />
                <Link href="/campaigns">
                    <p style={{textAlign: 'right', fontSize: '1rem',fontWeight: '100'}}>Campaña: Morbo Vicio</p>
                </Link>
            </div>
        </div>
    )
}