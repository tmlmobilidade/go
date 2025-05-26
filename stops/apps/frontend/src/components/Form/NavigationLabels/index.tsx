'use client';

import React from 'react';
import styles from './styles.module.css';
import { Button } from '@mantine/core';
import { useRouter } from 'next/navigation';
import { Routes } from '@/lib/routes';

export function NavigationLabels() {

    // A. Render components
    return (
        <div className={styles.container}>
            <div>Localização / Identificação / Confirmação</div>
        </div>
    );
}