import styles from './styles.module.css';
import Header from './Header';
import Map from './Map';

export default function MapContainer() {
    return <div className={styles.container}>
        <Header />
        <Map />
    </div>;
}
