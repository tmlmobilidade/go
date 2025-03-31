import Header from '@/components/common/Header';

import styles from '../styles.module.css';

export default function Media() {
    return <div className={styles.section}>
        <Header
            title={"Imagens & Vídeos"}
            description={"Suportes visuais."}
        />
    </div >;
}
