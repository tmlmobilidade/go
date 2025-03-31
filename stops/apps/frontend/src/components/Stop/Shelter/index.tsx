import Header from '@/components/common/Header';
import styles from '../styles.module.css';
import Item from '@/components/common/Row/Item';
import Row from '@/components/common/Row';

export default function Shelter() {
    return <div className={styles.section}>
        <Header
            title={"Abrigo"}
            description={"Informações relacionadas com o abrigo."}
        />

        <Row>
            <Item label={'Existe Abrigo?'} type={'text'} value={'Sim'} />
            <Item label={'Código do Abrigo'} type={'text'} value={'Sim'} />
            <Item label={'Entidade Gestora do Abrigo'} type={'text'} value={'Sim'} />
        </Row>

        <Row>
            <Item label={'Última verificação do estado do abrigo'} type={'text'} value={'Sim'} />
            <Item label={'Data de Instalação do Abrigo'} type={'text'} value={'Sim'} />
        </Row>
    </div>;
}
