"use client";

import { Tooltip } from '@tmlmobilidade/ui';
import { IconDeviceFloppy, IconX } from '@tabler/icons-react';

import styles from './styles.module.css';

interface LeftProps {
    isManual: boolean;
    long_name?: string;
}
export default function Left({ isManual, long_name }: LeftProps) {
    return <div className={styles.section}>
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
        <h3>{long_name || <i>Paragem sem Título</i>}</h3>
    </div>;
}