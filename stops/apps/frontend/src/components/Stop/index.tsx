"use client";

import type { Stop } from '@carrismetropolitana/api-types/network';

import Accessibility from "./Accessibility";
import AdminInformation from "./AdminInformation";
import Affectation from "./Affectation";
import Comments from "./Comments";
import Connections from "./Connections";
import Details from "./Details";
import Equipments from "./Equipments";
import Infrasctructure from "./Infrasctructure";
import MapContainer from "./MapContainer";
import Media from "./Media";
import PublicInformation from "./PublicInformation";
import Shelter from "./Shelter";

import { ManualContextProvider } from "@/contexts/Manual.context";

import styles from './styles.module.css';
import { useStopsContext } from "@/contexts/Stops.context";

export default function Stop() {
    const { actions } = useStopsContext();

    const stop: Stop = actions.getStopById("010001");

    console.log("--> stop", stop)

    return (
        <ManualContextProvider>
            <div className={styles.container}>
                <MapContainer />
                <Details />
                <AdminInformation />
                <Affectation />
                <Shelter />
                <Infrasctructure />
                <PublicInformation />
                <Accessibility />
                <Equipments />
                <Connections />
                <Media />
                <Comments />
            </div>
        </ManualContextProvider>
    );
}
