import { useRef, useEffect, useState } from 'react';
import styles from '../../styles/Video.module.css';
import Image from 'next/image';
import styles2 from '../../styles/LoadingScreen.module.css';
import Link from 'next/link';
import { differenceInDays, differenceInHours, differenceInMinutes, differenceInSeconds, differenceInMilliseconds, parseISO } from 'date-fns';

export default function Video() {
  const videoRef = useRef(null);
  const [showPlayer, setShowPlayer] = useState(false);
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
    milliseconds: 0
  });

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.playbackRate = 1.0;
    }
  }, []);

  useEffect(() => {
    // Set a fixed end date - Argentina timezone (UTC-3)
    const endDate = parseISO('2025-06-12T00:00:00-03:00');

    const calculateTimeLeft = () => {
      const now = new Date();
      const days = differenceInDays(endDate, now);
      const hours = differenceInHours(endDate, now) % 24;
      const minutes = differenceInMinutes(endDate, now) % 60;
      const seconds = differenceInSeconds(endDate, now) % 60;
      const milliseconds = differenceInMilliseconds(endDate, now) % 1000;

      console.log('Debug - Current time:', now);
      console.log('Debug - End date:', endDate);
      console.log('Debug - Time left:', { days, hours, minutes, seconds, milliseconds });

      if (days >= 0) {
        setTimeLeft({ days, hours, minutes, seconds, milliseconds });
      } else {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0, milliseconds: 0 });
      }
    };

    // Calculate immediately
    calculateTimeLeft();
    
    // Update every millisecond for smoother countdown
    const timer = setInterval(calculateTimeLeft, 10);

    // Cleanup
    return () => clearInterval(timer);
  }, []);

  const handleSeeRunway = async () => {
    setShowPlayer(true);

    // Optional: Try to lock orientation (works only after user interaction)
    if (screen.orientation && screen.orientation.lock) {
      try {
        await screen.orientation.lock('landscape');
      } catch (err) {
        console.warn('Orientation lock failed:', err);
      }
    }
  };

  const handleClose = () => {
    setShowPlayer(false);
  };

  return (
    <div className={styles.videoWrapper}>
      <div className={styles.videoContainer}>
        <video
          ref={videoRef}
          autoPlay
          muted
          loop
          playsInline
          className={styles.backgroundVideo}
        >
          <source src="/NCNL_RUNWAY_FINAL_2.mp4" type="video/mp4" />
        </video>
        <div className={styles.logoContainer}>
        <img 
          src="/NCNL_LOGO.png" 
          alt="NCNL Logo" 
          className={styles2.logo}
          style={{ filter: 'brightness(0) invert(1)', position: 'absolute', top: '0px', left: '0px', maxWidth: '1000px' }}
        />
              <p className={styles.runwayButton} style={{position: 'absolute', bottom: '0'}}>
                {`${timeLeft.days > 0 ? `${timeLeft.days}DIA ` : ''}${timeLeft.hours}:${timeLeft.minutes}:${timeLeft.seconds}.${Math.floor(timeLeft.milliseconds/100)}`}
              </p>
      </div>

        {/* "SEE RUNWAY" Button */}
        {/* Scrolling Text */}
        <div className={styles.scrollTextContainer}>
          {/* <div className={styles.scrollText}>
            Director Creativo: @paulnicolino<br />
            Director de Marca: @xul.vf<br /><br />
            Director de Arte: @buendiaignacio<br />
            Consultoría Creativa: @antonella.dellarossa @josephechenique_<br /><br />
            Productora Ejecutiva: @anitarod<br />
            Soldado único: @romaboi<br />
            Dirección equipo vestuario: @palomabelossi<br />
            Pelo: @n_iche<br />
            Makeup: @celestegonzalezmud<br /><br />
            Productoras: @genesisnotcis @lolanofal<br />
            Productor: @sandroyvos<br />
            PR: @carbatello<br /><br />
            Ayudante de vestuario: @lulugambarte<br />
            Confección en set : @lourgimenez<br />
            Asistente confección: @johistumpo<br /><br />
            Asistentes de producción: @yacodoorn @agus.tin @whoacore<br />
            Asistente de arte: @juanitaraw<br />
            Auto: @xrebagliati<br /><br />
            Instalación olfativa: @odor.sudor<br />
            Diseño sonoro: @faraonikababy<br />
            DJ rave: @estoesmabel<br />
            DJ recepción: @pedro999<br />
            Live Set: @akachebrolet<br />
            Fotógrafo back: @manriquepablo<br /><br />
            Agencias de Modelos<br />
            @about_mgmt<br />
            @castingclub_street<br />
            @look1modelmanagement<br />
            @sunmodelmanagement<br />
            @streetagency.xyz<br />
            @ceres_management<br /><br />
            Sponsors:<br />
            @lalindavinos<br />
            @chandon_ar<br />
            @donnet_te_ama<br />
            @lucasdanielemilio<br />
            @saldiaspolocultural<br />
            @cervezabrahma<br />
            @charquiqui<br /><br />
            DESIGNERS FW25<br />
            Invita: @hairssime<br />
            Produce & Organiza: @guillermoazarok<br />
            Dirección Creativa: @romina_cardillo @cnavar<br />
            Agencia creativa: @duoido<br />
            AI: @paulo_f_cueto & @isimo.agency<br />
            Prensa: @grupomass<br />
            Audiovisual: @caiman.danilo @herrerovalen<br />
            Apoya: @bacreativa - Ministerio de Desarrollo Económico<br />
            Acompañan: @segurosantartida @sparklingarg @eamoda<br />
            Locación: @ccomplejoartmedia<br />
          </div> */}
        </div>
      </div>

      {/* Modal Video Player */}
      {showPlayer && (
        <div className={styles.modalOverlay} onClick={handleClose}>
          <div className={styles.modalContent} onClick={e => e.stopPropagation()}>
            <video controls autoPlay className={styles.modalVideo}>
              <source src="/NCNL_RUNWA_ALTA_1.mp4" type="video/mp4" />
            </video>
            <button className={styles.closeButton} onClick={handleClose}>✕</button>
          </div>
        </div>
      )}
    </div>
  );
}