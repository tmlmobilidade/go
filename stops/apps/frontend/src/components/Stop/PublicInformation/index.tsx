"use client";

import Header from '@/components/common/Header';
import Item from '@/components/common/Row/Item';
import Row from '@/components/common/Row';

import styles from '../styles.module.css';

export default function PublicInformation() {
    return <div className={styles.section}>
        <Header
            title={"Informação ao Público"}
            description={"Informações relacionadas com os suportes de informação ao público."}
        />

        <Row>
            <Item label={"Tem Postalete"} type={"text"} value={"Sim"} />
            <Item label={"Entidade Gestora do Postalete"} type={"text"} value={"Sim"} />
        </Row>

        <Row>
            <Item label={"Tem Moldura?"} type={"text"} value={"Sim"} />
        </Row>

        <Row>
            <Item label={"Tem PIP Áudio?"} type={"text"} value={"Sim"} />
            <Item label={"Código do PIP Áudio"} type={"text"} value={"Sim"} />
        </Row>

        <Row>
            <Item label={"Tem PIP Realtime?"} type={"text"} value={"Sim"} />
            <Item label={"Código do PIP Realtime"} type={"text"} value={"Sim"} />
        </Row>

        <Row>
            <Item label={"Tem Sinalização H2OA?"} type={"text"} value={"Sim"} />
        </Row>

        <Row>
            <Item label={"Tem Horários?"} type={"text"} value={"Sim"} />
            <Item label={"Tem Horários Táteis?"} type={"text"} value={"Sim"} />
        </Row>

        <Row>
            <Item label={"Tem Mapa da Rede?"} type={"text"} value={"Sim"} />
        </Row>

        <Row>
            <Item label={"Última Manutenção dos Horários"} type={"text"} value={"Sim"} />
            <Item label={"Última Verificação dos Horários"} type={"text"} value={"Sim"} />
        </Row>

        <Row>
            <Item label={"Última Manutenção do Postalete"} type={"text"} value={"Sim"} />
            <Item label={"Última Verificação dos Postalete"} type={"text"} value={"Sim"} />
        </Row>
    </div>;
}
