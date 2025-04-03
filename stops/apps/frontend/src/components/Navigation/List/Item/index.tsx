"use client";

import styles from './styles.module.css';

interface ItemProps {
    stop: String;
}

export default function Item(props: ItemProps) {
    return <div className={styles.container}>
        {/* Left Side */}
        <div className={styles.info_container}>
            <p className={styles.name}>Rua Carlos Manuel Rodrigues Francisco (Escola)</p>
            <div className={styles.details}>
                <div className={styles.id}>010001</div>
                <div className={styles.coords}>38.7511111 -9.9511111</div>
            </div>
        </div>

        {/* Right Side */}
        <div className={styles.icon_container}>
            Icon
        </div>
    </div>;
}
