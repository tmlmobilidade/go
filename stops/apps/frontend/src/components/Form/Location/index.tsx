'use client';

import React from 'react';
import { StopsListViewMap } from '@/components/Stop/StopMap';
import { Coords } from '../Coords';

export function Location({ getStopById, data, lon, lat }) {
    //

    //
    // A. Render components
    return (
        <div>
            <StopsListViewMap data={data} getStopById={getStopById} />
            <Coords lat={lat} lon={lon} municipality={"Lisboa"} />
        </div>
    );
}