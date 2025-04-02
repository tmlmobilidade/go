import { Button, Tooltip } from '@tmlmobilidade/ui';
import { IconEye, IconWorldUpload, IconX } from '@tabler/icons-react';

import styles from './styles.module.css';

export default function Header() {
    return <div className={styles.header}>
        <div className={styles.section_left}>
            {/* Close Button */}
            <Tooltip label={"Fechar"} position={"bottom"}>
                <div className={styles.icon}>
                    <IconX />
                </div>
            </Tooltip>

            {/* Label */}
            <h3>Rua Carlos Manuel Rodrigues Francisco (Escola)</h3>
        </div>

        <div className={styles.section_right}>
            {/* Patterns Butoon */}
            <Tooltip label={"Ver Patterns Associados"} position={"bottom"}>
                <div className={styles.icon_blue} color={"blue"}>
                    <IconEye />
                </div>
            </Tooltip>

            {/* Stop Button */}
            <Tooltip label={"Ver esta paragem no Site"} position={"bottom"}>
                <div className={styles.icon_blue}>
                    <IconWorldUpload />
                </div>
            </Tooltip>
        </div>
    </div>;
}


