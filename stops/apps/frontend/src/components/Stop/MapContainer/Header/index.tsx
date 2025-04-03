"use client";

import { useManualContext } from '@/contexts/Manual.context';

import { Tooltip } from '@tmlmobilidade/ui';
import { IconDeviceFloppy, IconEye, IconWorldUpload, IconX } from '@tabler/icons-react';

import styles from './styles.module.css';

export default function Header() {
    const { isManual } = useManualContext();

    return <div className={styles.header}>
        <div className={styles.section}>
            {/* Manual -> Save Button */}
            {/* Automatic -> Close Button */}
            {isManual ?
                <Tooltip label={"Guardar Alterações"} position={"bottom"}>
                    <div className={styles.icon_green}>
                        <IconDeviceFloppy />
                    </div>
                </Tooltip> :
                <Tooltip label={"Fechar"} position={"bottom"}>
                    <div className={styles.icon}>
                        <IconX />
                    </div>
                </Tooltip>
            }

            {/* Label */}
            <h3>Rua Carlos Manuel Rodrigues Francisco (Escola)</h3>
        </div>

        <div className={styles.section}>
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
    </div >;
}


