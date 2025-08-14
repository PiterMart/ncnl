import styles from '../../styles/Campaigns.module.css';
import Image from 'next/image';

export default function Campaigns() {
    // Campaign images array
    const campaignImages = [
        '/campaigns/morbovicio/mv1.jpg',
        '/campaigns/morbovicio/mv2.jpg',
        '/campaigns/morbovicio/mv3.jpg',
        '/campaigns/morbovicio/mv4.jpg',
        '/campaigns/morbovicio/mv5.jpg',
        '/campaigns/morbovicio/mv6.jpg',
        '/campaigns/morbovicio/mv7.jpg',
        '/campaigns/morbovicio/mv8.jpg'
    ];

    return (
        <div className={styles.campaigns}>
            <h1 className={styles.campaignTitle}>MORBO VICIO</h1>
            
            <div className={styles.campaignImages}>
                {campaignImages.map((image, index) => (
                    <Image
                        key={index}
                        src={image}
                        alt={`Morbo Vicio Campaign Image ${index + 1}`}
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
                    <li><strong>Fotografía:</strong> Joseph Echenique @josephechenique_ </li>
                </ul>
            </div>
        </div>
    );
}