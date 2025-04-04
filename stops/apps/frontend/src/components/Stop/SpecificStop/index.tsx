"use client";

import type { Stop } from '@carrismetropolitana/api-types/network';

import Accessibility from "../Accessibility";
import AdminInformation from "../AdminInformation";
import Affectation from "../Affectation";
import Comments from "../Comments";
import Connections from "../Connections";
import Details from "../Details";
import Equipments from "../Equipments";
import Infrasctructure from "../Infrasctructure";
import MapContainer from "../MapContainer";
import Media from "../Media";
import PublicInformation from "../PublicInformation";
import Shelter from "../Shelter";

import styles from '../styles.module.css';

interface SpecificStopProps {
    stop: Stop;
}
export default function Stop({ stop }: SpecificStopProps) {
    return (
        <div className={styles.container}>
            <MapContainer generic={false} />
            <Details
                id={stop?.id || ""}
                lat={stop?.lat || 0}
                lon={stop?.lon || 0}
                old_long_name={stop?.long_name || ""}
                long_name={stop?.long_name || ""}
                short_name={stop?.short_name || ""}
                tts_name={stop?.tts_name || ""}
                operational_status={stop?.operational_status || "voided"}   // TODO: Check corresponding strings, example: active -> "Paragem Activa"
            />
            <AdminInformation
                municipality_id={stop?.municipality_id || ""}   // TODO: Use name instead of id
                parish={"TODO"} // TODO: Check where to get this data
                locality_id={stop?.locality_id || ""}   // TODO: Use name instead of id
                jurisdication={"TODO"}  // TODO: Check where to get this data
            />
            <Affectation
            // TODO: Check where to get this data
            />
            <Shelter />
            <Infrasctructure />
            <PublicInformation />
            <Accessibility />
            <Equipments />
            <Connections />
            <Media />
            <Comments />
        </div>
    );
}
