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
            <Item label={"Existe Poste?"} type={"text"} value={"Sim"} />
            <Item label={"Existe Cobertura?"} type={"text"} value={"Sim"} />
        </Row>

        <Row>
            <Item label={"Existe Mupi?"} type={"text"} value={"Sim"} />
            <Item label={"Existe Banco?"} type={"text"} value={"Sim"} />
            <Item label={"Existe Papeleira?"} type={"text"} value={"Sim"} />
        </Row>

        <Row>
            <Item label={"Existe Iluminação?"} type={"text"} value={"Sim"} />
            <Item label={"Existe Ligação Elétrica?"} type={"text"} value={"Sim"} />
        </Row>

        <Row>
            <Item label={"Tipo de Relação com a Via"} type={"text"} value={"Sim"} />
        </Row>

        <Row>
            <Item label={"Última Manutenção da Infraestrutura"} type={"text"} value={"Sim"} />
            <Item label={"Última Verificação da Infraestrutura"} type={"text"} value={"Sim"} />
        </Row>
    </div >;
}
