'use client';

import Accessibility from "./Accessibility";
import AdminInformation from "./AdminInformation";
import Affectation from "./Affectation";
import Comments from "./Comments";
import Connections from "./Connections";
import Details from "./Details";
import Equipments from "./Equipments";
import Infrasctructure from "./Infrasctructure";
import Map from "./Map";
import Media from "./Media";
import PublicInformation from "./PublicInformation";
import Shelter from "./Shelter";

// import { Stop } from "@tmlmobilidade/types";

// interface StopProps {
//     stop: Stop;
// }

export default function Stop() {
// export default function StopContainer({ stop }: StopContainerProps) {
//     const { _id,
//         created_at,
//         updated_at,
//         name,
//         jurisdiction,
//         operational_status,
//         short_name,
//         tts_name,
//         district_id,
//         latitude,
//         locality_id,
//         longitude,
//         municipality_id,
//         parish_id,
//         bench_status,
//         docking_bay_type,
//         electricity_status,
//         flag_status,
//         lighting_status,
//         pavement_type,
//         pole_status,
//         road_type,
//         shelter_code,
//         shelter_maintainer,
//         shelter_make,
//         shelter_model,
//         shelter_status,
//         sidewalk_type,
//         last_infrastructure_check,
//         last_infrastructure_maintenance,
//         last_schedules_check,
//         last_schedules_maintenance,
//         connections,
//         facilities,
//         comments } = stop;

    return <div>
        <Map />
        {/* <Details
            _id={_id}
            latitude={latitude}
            longitude={longitude}
            name={name}
            operational_status={operational_status}
            short_name={short_name}
            tts_name={tts_name}
        />
        <AdminInformation 
            jurisdiction={jurisdiction}
            municipality_id={municipality_id}
            parish_id={parish_id}
            locality_id={locality_id}
        /> */}
        <Details
            _id={"_id"}
            latitude={10}
            longitude={10}
            name={"name"}
            operational_status={"active"}
            short_name={"short_name"}
            tts_name={"tts_name"}
        />
        <AdminInformation 
            jurisdiction={"ip"}
            municipality_id={"municipality_id"}
            parish_id={"parish_id"}
            locality_id={"locality_id"}
        />
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
