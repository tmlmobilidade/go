import Header from '@/components/common/Header';
import styles from '../styles.module.css';
import Row from '@/components/common/Row';
import Item from '@/components/common/Row/Item';

export default function AdminInformation() {
    return <div className={styles.section}>
        <Header
            title={"Informação Administrativa"}
            description={"Informações sobre a localização administrativa e responsabilidade de gestão desta paragem"}
        />

        <Row>
            <Item label={"Município"} type={"text"} value={"Sim"} />
            <Item label={"Freguesia"} type={"text"} value={"Sim"} />
            <Item label={"Localidade"} type={"text"} value={"Sim"} />
        </Row>

        <Row>
            <Item label={"Jurisdição"} type={"text"} value={"Sim"} />
        </Row>
    </div>;
}
