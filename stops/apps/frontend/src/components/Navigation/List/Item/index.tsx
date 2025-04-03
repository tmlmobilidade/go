"use client";

import type { Stop } from '@carrismetropolitana/api-types/network';

import styles from './styles.module.css';

interface ItemProps {
    stop: Stop;
}

export default function Item({ stop }: ItemProps) {
    return <div className={styles.container}>
        {/* Left Side */}
        <div className={styles.info_container}>
            <p className={styles.name}>{stop.long_name}</p>
            <div className={styles.details}>
                <div className={styles.id}>{stop.id}</div>
                <div className={styles.coords}>{stop.lat} {stop.lon}</div>
            </div>
        </div>

        {/* Right Side */}
        <div className={styles.icon_container}>
            Icon
        </div>
    </div>;
}
