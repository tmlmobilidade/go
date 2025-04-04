"use client";

import { Tooltip } from '@tmlmobilidade/ui';
import { IconArrowsMinimize } from '@tabler/icons-react';

import styles from './styles.module.css';

export default function Left() {
    return <div className={styles.section}>
        {/* Re-Center Map Button */}
        <Tooltip label={"Re-center Map"} position={"bottom"}>
            <div className={styles.icon}>
                <IconArrowsMinimize />
            </div>
        </Tooltip>

        {/* Label */}
        <h3>All Stops</h3>
    </div>;
}


