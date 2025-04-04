"use client";

import type { Stop } from '@carrismetropolitana/api-types/network';

import { ManualContextProvider } from "@/contexts/Manual.context";

import { useStopsContext } from "@/contexts/Stops.context";
import SpecificStop from './SpecificStop';
import GenericStop from './GenericStop';

export default function Stop() {
    const { actions } = useStopsContext();

    const stopId: string = "010001";
    const stop: Stop = actions.getStopById(stopId);

    console.log("--> stop", stop);

    return (
        <ManualContextProvider>
            {
                stopId ? <SpecificStop stop={stop} /> : <GenericStop />
            }
        </ManualContextProvider>
    );
}
