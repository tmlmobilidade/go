import { Grid } from '@tmlmobilidade/ui';

import Header from '@/components/common/Header';
import Item from '@/components/common/Row/Item';

import styles from '../styles.module.css';

export default function Equipments() {
    return <div className={styles.section}>
        <Header
            title={"Equipamentos Servidos"}
            description={"Quais são os equipamentos que esta paragem serve."}
        />

        <Grid className={styles.grid} columns={"abcd"}>
            <Item label={"Clínica"} value={true} />
            <Item label={"Hospital"} value={true} />
            <Item label={"Universidade"} value={false} />
            <Item label={"Escola"} value={true} />

            <Item label={"Esquadra"} value={false} />
            <Item label={"Bombeiros"} value={true} />
            <Item label={"Zona Comercial"} value={true} />
            <Item label={"Edifício Histórico"} value={false} />

            <Item label={"Espaço navegante®"} value={true} />
            <Item label={"Praia"} value={true} />
        </Grid>
    </div >;
}
