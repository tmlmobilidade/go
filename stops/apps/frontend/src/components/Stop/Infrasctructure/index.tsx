"use client";

import Header from '@/components/common/Header';
import Item from '@/components/common/Row/Item';
import Row from '@/components/common/Row';

import styles from '../styles.module.css';

export default function Infrasctructure() {
    return <div className={styles.section}>
        {/* Header */}
        <Header
            title={"Infraestrutura"}
            description={"Informações relacionadas com os equipamentos da paragem e envolvente."}
        />

        <Row>
            <Item label={"Existe Poste?"} value={"Desconhecido"} />
            <Item label={"Existe Cobertura?"} value={"Desconhecido"} />
        </Row>

        <Row>
            <Item label={"Existe Mupi?"} value={"Desconhecido"} />
            <Item label={"Existe Banco?"} value={"Desconhecido"} />
            <Item label={"Existe Papeleira?"} value={"Desconhecido"} />
        </Row>

        <Row>
            <Item label={"Existe Iluminação?"} value={"Desconhecido"} />
            <Item label={"Existe Ligação Elétrica?"} value={"Desconhecido"} />
        </Row>

        <Row>
            <Item label={"Tipo de Relação com a Via"} value={"Desconhecido"} />
        </Row>

        <Row>
            <Item label={"Última Manutenção da Infraestrutura"} placeholder={"2023-02-10"} value={"Sim"} />
            <Item label={"Última Verificação da Infraestrutura"} placeholder={"2023-02-10"} value={"Sim"} />
        </Row>
    </div >;
}
