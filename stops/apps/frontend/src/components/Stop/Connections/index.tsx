
import Header from '@/components/common/Header';
import Item from '@/components/common/Row/Item';
import Row from '@/components/common/Row';

import styles from '../styles.module.css';

export default function Connections() {
    return <div className={styles.section}>
        <Header
            title={"Ligações Intermodais"}
            description={"Quais são os outros modos de transporte, para além do autocarro, que esteja paragem serve."}
        />

        <Row>
            <Item label={"Metro"} value={true} />
            <Item label={"Metro de Superfície"} value={true} />
            <Item label={"Comboio"} value={true} />
            <Item label={"Barco"} value={true} />
        </Row>

        <Row>
            <Item label={"Aeroporto"} value={true} />
            <Item label={"Partilha de Bicicletas"} value={true} />
            <Item label={"Estacionamento de Bicicletas"} value={true} />
            <Item label={"Estacionamento Automóvel"} value={true} />
        </Row>
    </div>;
}
