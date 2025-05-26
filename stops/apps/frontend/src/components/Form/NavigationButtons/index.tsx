'use client';

import React from 'react';
import styles from './styles.module.css';
import { Button} from '@mantine/core';
import { useRouter } from 'next/navigation';
import { Routes } from '@/lib/routes';

export function NavigationButtons() {
    const router = useRouter();

    // A. Render components
    return (
        <div className={styles.container}>
            <Button className={styles.button} onClick={() => router.push(Routes.STOP_LIST)}>Cancelar</Button>
            <Button className={styles.button}>Avançar</Button>
        </div>
    );
}