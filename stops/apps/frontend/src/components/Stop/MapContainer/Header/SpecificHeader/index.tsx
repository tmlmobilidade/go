"use client";

import { Tooltip } from '@tmlmobilidade/ui';
import { IconArrowsMinimize, IconMapPinFilled } from '@tabler/icons-react';
import { Button } from '@mantine/core';
import { useToggle } from '@mantine/hooks';

import styles from './styles.module.css';

export default function SpecificHeader() {
    const [toggleValue, setToggleValue] = useToggle(['Mapa', 'Satélite'] as const);

    return <div className={styles.header}>
        <div className={styles.section}>
            {/* Re-Center Map Button */}
            <Tooltip label={"Re-center Map"} position={"bottom"}>
                <div className={styles.icon}>
                    <IconArrowsMinimize />
                </div>
            </Tooltip>

            {/* Label */}
            <h3>All Stops</h3>
        </div>

        <div className={styles.section}>
            {/* Patterns Butoon */}
            <Button className={styles.button} onClick={() => setToggleValue()}>
                {toggleValue}
            </Button>

            {/* Stop Button */}
            <Tooltip label={"Open in Google Maps"} position={"bottom"}>
                <div
                    className={styles.icon}
                    onClick={() => window.open(`https://www.google.com/maps/@38.6512317,-8.8813723,10z`, "_blank")}
                >
                    <IconMapPinFilled />
                </div>
            </Tooltip>
        </div>
    </div >;
}


