"use client";

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

import styles from './styles.module.css';

export default function Stop() {
    return <div className={styles.container}>
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
    </div>;
}
