import styles from '../../styles/Campaigns.module.css';
import Image from 'next/image';

export default function Lookbook() {
    // Lookbook images array
    const lookbookImages = [
        '/lookbook/lb1.jpg',
        '/lookbook/lb2.jpg',
        '/lookbook/lb3.jpg',
        '/lookbook/lb4.jpg',
        '/lookbook/lb5.jpg',
        '/lookbook/lb6.jpg',
        '/lookbook/lb7.jpg',
        '/lookbook/lb8.jpg'
    ];

    return (
        <div className={styles.campaigns}>
            {/* <h1 className={styles.campaignTitle}>LOOKBOOK</h1> */}
            
            <div className={styles.campaignImages} style={{marginTop: '10rem'}}>
                {lookbookImages.map((image, index) => (
                    <Image
                        key={index}
                        src={image}
                        alt={`Lookbook Image ${index + 1}`}
                        width={400}
                        height={600}
                        className={styles.campaignImage}
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    />
                ))}
            </div>
            
            <div className={styles.credits}>
                {/* <h2>Créditos</h2> */}
                <ul className={styles.creditsList}>
                    <li><strong>DIRECCIÓN CREATIVA:</strong> PAUL NICOLINO</li>
                    <li><strong>DIRECCIÓN DE ARTE:</strong> IGNACIO BUENDIA</li>
                    <li><strong>FOTOGRAFÍA:</strong> JOSEPH ECHENIQUE</li>
                </ul>
            </div>
        </div>
    );
}