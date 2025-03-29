import Header from "@/components/common/Header";
import Row from "@/components/common/Row";
import Item from "@/components/common/Row/Item";

import styles from './styles.module.css';

export default function Accessibility() {
    return <div className={styles.container}>
        <Header
            title={"Acessibilidade"}
            description={"Informações sobre a acessibilidade da paragem e sua envolvente."}
        />

        <Row>
            <Item label={"Tem Passeio?"} type={"text"} value={"Sim"} />
            <Item label={"Tipo de Passeio"} type={"text"} value={"Sim"} />
        </Row>

        <Row>
            <Item label={"Tem Passadeira?"} type={"text"} value={"Sim"} />
            <Item label={"Tem Acesso Rebaixado/Contínuo?"} type={"text"} value={"Sim"} />
            <Item label={"Tem Acesso Largo?"} type={"text"} value={"Sim"} />
            <Item label={"Tem Pavimento Tátil?"} type={"text"} value={"Sim"} />
        </Row>

        <Row>
            <Item label={"Tem Estacionamento Abusivo?"} type={"text"} value={"Sim"} />
            <Item label={"Permite Embarque de PMR?"} type={"text"} value={"Sim"} />
        </Row>

        <Row>
            <Item label={"Última Manutenção da Acessibilidade"} type={"text"} value={"Sim"} />
            <Item label={"Última Verificação da Acessibilidade"} type={"text"} value={"Sim"} />
        </Row>
    </div>;
}
