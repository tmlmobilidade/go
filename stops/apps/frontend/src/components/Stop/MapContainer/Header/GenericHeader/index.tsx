"use client";

import { useToggle } from '@mantine/hooks';

import Left from './Left';
import Right from './Right';

import styles from './styles.module.css';

export default function GenericHeader() {
    const [toggleValue, setToggleValue] = useToggle(['Mapa', 'Satélite'] as const);
    console.log("Specific")
    return <div className={styles.header}>
        <Left />
        <Right toggleValue={toggleValue} setToggleValue={setToggleValue} />
    </div >;
}


