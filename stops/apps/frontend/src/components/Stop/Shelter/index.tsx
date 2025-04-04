"use client";

import Header from '@/components/common/Header';
import Item from '@/components/common/Row/Item';
import Row from '@/components/common/Row';

import styles from '../styles.module.css';

export default function Shelter() {
    return <div className={styles.section}>
        <Header
            title={"Abrigo"}
            description={"Informações relacionadas com o abrigo."}
        />

        <Row>
            <Item label={'Existe Abrigo?'} value={'Desconhecido'} />
            <Item label={'Código do Abrigo'} placeholder={"SH1234"} value={'Sim'} />
            <Item label={'Entidade Gestora do Abrigo'} placeholder={"JC Decaux"} value={'Sim'} />
        </Row>

        <Row>
            <Item label={'Última verificação do estado do abrigo'} placeholder={"2024-09-12"} value={'Sim'} />
            <Item label={'Data de Instalação do Abrigo'} placeholder={"2024-09"} value={'Sim'} />
        </Row>
    </div>;
}
