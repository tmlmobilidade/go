'use client';

import React from 'react';
import styles from './styles.module.css';
import { Button } from '@mantine/core';
import { useRouter } from 'next/navigation';
import { Routes } from '@/lib/routes';
import { IconMapPlus } from '@tabler/icons-react';

enum Phase {
    LOCATION = "LOCATION",
    IDENTIFICATION = "IDENTIFICATION",
    CONFIRMATION = "CONFIRMATION"
}

export function NavigationButtons({ actions, phase, setPhase }) {
    const router = useRouter();
    console.log("phase", phase)
    // A. Render components
    return (
        <div className={styles.container}>
            {phase === Phase.LOCATION &&
                <Button className={styles.button} onClick={() => router.push(Routes.STOP_LIST)}>
                    Cancelar
                </Button>
            }

            {phase === Phase.IDENTIFICATION &&
                <Button className={styles.button} onClick={() => setPhase(Phase.LOCATION)}>
                    Voltar
                </Button>
            }

            {phase === Phase.CONFIRMATION &&
                <Button className={styles.button} onClick={() => setPhase(Phase.IDENTIFICATION)}>
                    Voltar
                </Button>
            }


            {phase === Phase.LOCATION &&
                <Button className={styles.button} onClick={() => setPhase(Phase.IDENTIFICATION)}>
                    Avançar
                </Button>
            }

            {phase === Phase.IDENTIFICATION &&
                <Button className={styles.button} onClick={() => setPhase(Phase.CONFIRMATION)}>
                    Avançar
                </Button>
            }

            {phase === Phase.CONFIRMATION &&
                <Button className={styles.button} onClick={() => {
                    actions.saveStop();
                    router.push(Routes.STOP_DETAIL('new'));
                    // router.push(Routes.STOP_LIST);
                }}>
                    <IconMapPlus />
                    Criar Paragem
                </Button>
            }
        </div>
    );
}