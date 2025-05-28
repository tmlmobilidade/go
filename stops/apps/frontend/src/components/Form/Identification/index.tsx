'use client';

import React from 'react';
import styles from './styles.module.css';

export function Identification() {
    //

    //
    // A. Render components
    return (
        <div className={styles.container}>
            <div>
                <div>Nome da Paragem</div>
                <div>Introduza o nome completo da paragem, sem abreviaturas.</div>
                <div>INPUT</div>
            </div>

            <div>
                <div>Nome Curto da Paragem</div>
                <div>O nome curto é automaticamente construído com base nas abreviaturas mais comuns.</div>
                <div>INPUT</div>
            </div>

            <div>
                <div>Localidade da Paragem</div>
                <div>Introduza uma localidade para esta paragem.</div>
                <div>INPUT</div>
            </div>
        </div>
    );
}