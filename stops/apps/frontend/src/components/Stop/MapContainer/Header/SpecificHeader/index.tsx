"use client";

import { useToggle } from '@mantine/hooks';

import Left from './Left.tsx';
import Right from './Right.tsx';

import styles from './styles.module.css';

export default function SpecificHeader() {
    const [toggleValue, setToggleValue] = useToggle(['Mapa', 'Satélite'] as const);

    return <div className={styles.header}>
        <Left />
        <Right toggleValue={toggleValue} setToggleValue={setToggleValue} />
    </div >;
}


