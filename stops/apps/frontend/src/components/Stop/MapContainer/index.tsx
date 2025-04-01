import styles from './styles.module.css';
import Header from './Header';
import Mapper from './Mapper';

export default function MapContainer() {
    return <div className={styles.container}>
        <Header />
        <Mapper />
    </div>;
}
