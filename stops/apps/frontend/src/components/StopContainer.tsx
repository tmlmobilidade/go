import Accessibility from "./Accessibility";
import AdminInformation from "./AdminInformation";
import Affectation from "./Affectation";
import Comments from "./Comments";
import Connections from "./Connections";
import Details from "./Details";
import Equipments from "./Equipments";
import Infrasctructure from "./Infrastructure";
import Map from "./Map";
import Media from "./Media";
import PublicInformation from "./PublicInformation";
import Shelter from "./Shelter";

export default function StopContainer() {
    return <div>
        <Map />
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
