"use client";

import styles from './styles.module.css';
import Header from './Header';
import Mapper from './Mapper';

interface MapContainerProps {
    generic: boolean;
}

export default function MapContainer({ generic }: MapContainerProps) {
    console.log("--> generic", generic)
    return <div className={styles.container}>
        <Header generic={generic} />
        <Mapper generic={generic} />
    </div>;
}
