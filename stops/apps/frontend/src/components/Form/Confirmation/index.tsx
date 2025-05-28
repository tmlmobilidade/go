'use client';

import React from 'react';
import styles from './styles.module.css';

export function Confirmation({ data }) {
    //

    //
    // A. Render components
    return (
        <div className={styles.container}>
            <div>{data.form.getValues().name}</div>
            <div className={styles.location}>{data.form.getValues().municipality}</div>
            {/* <div className={styles.location}>{data.form.getValues().locality_id}, {data.form.getValues().municipality}</div> */}
            <div className={styles.coords}>{data.form.getValues().latitude}, {data.form.getValues().longitude}</div>
        </div>
    );
}