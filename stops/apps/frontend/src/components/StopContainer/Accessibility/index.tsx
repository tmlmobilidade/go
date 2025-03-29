import Header from "@/components/common/Header";
import InputsContainer from "@/components/common/InputsContainer";
import Item from "@/components/common/InputsContainer/Item";

export default function Accessibility() {
    return <>
        <Header
            title={"Acessibilidade"}
            description={"Informações sobre a acessibilidade da paragem e sua envolvente."}
        />

        <InputsContainer>
            <Item label={"Tem Passeio?"} type={"text"} value={"Sim"} />
            <Item label={"Tipo de Passeio"} type={"text"} value={"Sim"} />
        </InputsContainer>

        <InputsContainer>
            <Item label={"Tem Passadeira?"} type={"text"} value={"Sim"} />
            <Item label={"Tem Acesso Rebaixado/Contínuo?"} type={"text"} value={"Sim"} />
            <Item label={"Tem Acesso Largo?"} type={"text"} value={"Sim"} />
            <Item label={"Tem Pavimento Tátil?"} type={"text"} value={"Sim"} />
        </InputsContainer>


        <InputsContainer>
            <Item label={"Tem Estacionamento Abusivo?"} type={"text"} value={"Sim"} />
            <Item label={"Permite Embarque de PMR?"} type={"text"} value={"Sim"} />
        </InputsContainer>

        <InputsContainer>
            <Item label={"Última Manutenção da Acessibilidade"} type={"text"} value={"Sim"} />
            <Item label={"Última Verificação da Acessibilidade"} type={"text"} value={"Sim"} />
        </InputsContainer>
    </>;
}
