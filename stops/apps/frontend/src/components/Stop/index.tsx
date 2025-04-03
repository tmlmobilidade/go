"use client";

import { useState, useContext } from "react";

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

import { ManualContext } from "@/contexts/Manual.context";

import styles from './styles.module.css';

export default function Stop() {
    const [isManual, setIsManual] = useState(false);

    return (
        <ManualContext.Provider value={{ isManual, setIsManual }}>
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
        </ManualContext.Provider>
    );
}
