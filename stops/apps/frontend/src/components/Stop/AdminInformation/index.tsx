"use client";

import Header from '@/components/common/Header';
import Row from '@/components/common/Row';
import Item from '@/components/common/Row/Item';

import styles from '../styles.module.css';

interface AdminInformationProps {
    municipality_id: string;
    parish: string;
    locality_id: string;
    jurisdication: string;
}

export default function AdminInformation({ municipality_id, parish, locality_id, jurisdication }: AdminInformationProps) {
    return <div className={styles.section}>
        <Header
            title={"Informação Administrativa"}
            description={"Informações sobre a localização administrativa e responsabilidade de gestão desta paragem"}
        />

        <Row>
            <Item label={"Município"} placeholder={"Escolha uma opção..."} value={municipality_id} />
            <Item label={"Freguesia"} placeholder={"Maçãs"} value={parish} />
            <Item label={"Localidade"} placeholder={"Bairro das Maçãs"} value={locality_id} />
        </Row>

        <Row>
            <Item label={"Jurisdição"} placeholder={"CM Moita"} value={jurisdication} />
        </Row>
    </div>;
}
