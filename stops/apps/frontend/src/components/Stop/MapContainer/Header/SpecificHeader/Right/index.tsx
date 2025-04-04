"use client";

import { Tooltip } from '@tmlmobilidade/ui';
import { IconEye, IconWorldUpload } from '@tabler/icons-react';

import styles from '../styles.module.css';

interface RightProps {
    stopId: string;
    open: () => void;
}
export default function Right({ stopId, open }: RightProps) {
    return <div className={styles.section}>
        {/* Patterns Butoon */}
        <Tooltip label={"Ver Patterns Associados"} position={"bottom"}>
            <div className={styles.icon_blue} onClick={open} color={"blue"}>
                <IconEye />
            </div>
        </Tooltip>

        {/* Stop Button */}
        <Tooltip label={"Ver esta paragem no Site"} position={"bottom"}>
            <div
                className={styles.icon_blue}
                onClick={() => window.open(`https://www.carrismetropolitana.pt/stops/${stopId}`, "_blank")}
            >
                <IconWorldUpload />
            </div>
        </Tooltip>
    </div>;
}