import Header from "@/components/common/Header";
import Row from "@/components/common/Row";
import Item from "@/components/common/Row/Item";

export default function Affectation() {
    return <div>
        <Header
            title={"Afetação"}
            description={"Configuração dos passes aceites por esta paragem. É possível alterar estas definições para cada pattern."}
        />

        <Row>
            <Item label={"Aceitação de Passes pré-definida"} type={"text"} value={"Sim"} placeholder={"Escolha uma opção..."} />
        </Row>
    </div>;
}
