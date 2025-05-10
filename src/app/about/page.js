import styles from '../../styles/About.module.css';

export default function About() {
    return (
        <div className={styles.about}>
            <div className={styles.aboutContent}>
                <h1>
                    Nacional aka NCNL es un proyecto nacido
                    de una sensibilidad profundamente polí-
                    tica y social.
                    </h1>
                <p>
                    Nuestra visión se centra en dialogar
                    con
                     los iconos de la sociedad y la estética
                    nacional, tomando inspiración de múltiples
                    universos: la música, las comunidades di-
                    sidentes, los encuentros sociales, el fervor
                    del fútbol, las turbulencias políticas, la
                    efervescencia de la vida nocturna, el arte
                    en todas sus formas, el amor y la comple-
                    jidad de las relaciones humanas. Estos
                    elementos constituyen la esencia de nues-
                    tro vínculo creativo.
                </p>
                <p>
                    Dirigimos nuestro mensaje a quienes
                    forjaron su identidad entre los años noven-
                    ta y dos mil, generaciones moldeadas por
                    un contexto vibrante y contradictorio.
                </p>
            </div>
        </div>
    )
}