import Header from '@/components/common/Header';
import Item from '@/components/common/Row/Item';
import Row from '@/components/common/Row';

import styles from '../styles.module.css';

export default function Media() {
    return <div className={styles.section}>
        <Header
            title={"Imagens & Vídeos"}
            description={"Suportes visuais."}
        />
    </div >;
}
