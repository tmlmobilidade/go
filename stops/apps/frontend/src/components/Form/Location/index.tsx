'use client';

import React from 'react';
import { StopsListViewMap } from '@/components/Stop/StopMap';
import { Coords } from '../Coords';
import styles from './styles.module.css';

export function Location({ getStopById, data }) {
    //

    //
    // A. Render components
    return (
        <div className={styles.container}>
            <StopsListViewMap data={data} getStopById={getStopById} />
            <Coords latitude={data.form.getValues().latitude} longitude={data.form.getValues().longitude} municipality={"Lisboa"} />
        </div>
    );
}