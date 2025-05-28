'use client';

import React from 'react';
import styles from './styles.module.css';

export function Confirmation() {
    //

    //
    // A. Render components
    return (
        <div className={styles.container}>
            <div>Nome da Paragem</div>
            <div className={styles.location}>Localidade, Município</div>
            <div className={styles.coords}>CoordenadasX, CoordenadasY</div>
        </div>
    );
}