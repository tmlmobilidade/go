"use client";

import { SetStateAction } from 'react';

import { Tooltip } from '@tmlmobilidade/ui';
import { IconMapPinFilled } from '@tabler/icons-react';
import { Button } from '@mantine/core';

import styles from './styles.module.css';

interface RightProps {
    toggleValue: "Mapa" | "Satélite";
    setToggleValue: (value?: SetStateAction<"Mapa" | "Satélite">) => void;
}

export default function Right({ toggleValue, setToggleValue }: RightProps) {
    // const [toggleValue, setToggleValue] = useToggle(['Mapa', 'Satélite'] as const);

    return <div className={styles.section}>
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
    </div>;
}


