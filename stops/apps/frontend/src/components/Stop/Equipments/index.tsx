import Header from '@/components/common/Header';
import Item from '@/components/common/Row/Item';
import Row from '@/components/common/Row';

import styles from '../styles.module.css';

export default function Equipments() {
    return <div className={styles.section}>
        <Header 
            title={"Equipamentos Servidos"}
            description={"Quais são os equipamentos que esta paragem serve."}
        />

        {/* <Row>
            <Item label={""} type={""} value={""} />
        </Row> */}
        {/*  */}
        <div>
            <div>
                <input type="checkbox" name="" id="" />
                <div>Clínica</div>
            </div>
            
            <div>
                <input type="checkbox" name="" id="" />
                <div>Hospital</div>
            </div>

            <div>
                <input type="checkbox" name="" id="" />
                <div>Universidade</div>
            </div>

            <div>
                <input type="checkbox" name="" id="" />
                <div>Escola</div>
            </div>

            <div>
                <input type="checkbox" name="" id="" />
                <div>Esquadra</div>
            </div>

            <div>
                <input type="checkbox" name="" id="" />
                <div>Bombeiros</div>
            </div>

            <div>
                <input type="checkbox" name="" id="" />
                <div>Zona Comercial</div>
            </div>

            <div>
                <input type="checkbox" name="" id="" />
                <div>Edifício Histórico</div>
            </div>

            <div>
                <input type="checkbox" name="" id="" />
                <div>Espaço navegante®</div>
            </div>

            <div>
                <input type="checkbox" name="" id="" />
                <div>Praia</div>
            </div>
        </div>
    </div>;
}
