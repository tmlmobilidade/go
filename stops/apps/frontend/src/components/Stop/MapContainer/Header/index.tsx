import { Button, Tooltip } from '@tmlmobilidade/ui';
import { IconEye, IconWorldUpload, IconX } from '@tabler/icons-react';

import styles from './styles.module.css';

export default function Header() {
    return <div className={styles.header}>
        {/* Close Button */}
        <Tooltip label={"Fechar"} position={"bottom"}>
            <div className={styles.icon}>
                <IconX />
            </div>
        </Tooltip>

        {/* Label */}
        <h3>Rua Carlos Manuel Rodrigues Francisco (Escola)</h3>

        {/* Patterns Butoon */}
        <Tooltip label={"Ver Patterns Associados"} position={"bottom"}>
            <div className={styles.icon}>
                <IconEye />
            </div>
        </Tooltip>

        {/* Stop Button */}
        <Tooltip label={"Ver esta paragem no Site"} position={"bottom"}>
            <div className={styles.icon}>
                <IconWorldUpload />
            </div>
        </Tooltip>
    </div>;
}


