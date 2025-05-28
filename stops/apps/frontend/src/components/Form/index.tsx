'use client';

import { Modal } from '@mantine/core';
import { Pane, useDisclosure } from '@tmlmobilidade/ui';
import { useStopsContext } from '@/contexts/Stops.context';
import { useStopsDetailContext } from '@/contexts/StopsDetail.context';
import { useRouter } from 'next/navigation';
import { Routes } from '@/lib/routes';
import styles from './styles.module.css';
import { useState } from 'react';
import { Location } from './Location'; // Ensure Location is a valid React component
import { NavigationButtons } from './NavigationButtons';
import { NavigationLabels } from './NavigationLabels';
import { Confirmation } from './Confirmation';
import { Identification } from './Identification';

enum Phase {
    LOCATION = "LOCATION",
    IDENTIFICATION = "IDENTIFICATION",
    CONFIRMATION = "CONFIRMATION"
}

export function Form() {
    // const [opened, { _open, _close }] = useDisclosure(true);
    const [opened] = useDisclosure(true);
    const { actions: { getStopById } } = useStopsContext();
    const router = useRouter();

    const [phase, setPhase] = useState<Phase>(Phase.LOCATION);
    const { actions, data, flags } = useStopsDetailContext();
    console.log("lat", data.form.getValues().latitude)
    console.log("lon", data.form.getValues().longitude)
    // A. Render components
    return (
        <div>
            <Modal opened={opened} onClose={() => router.push(Routes.STOP_LIST)} title="Nova Paragem" fullScreen={true}>
                {/* Modal content */}
                <Pane>
                    <div className={styles.container}>
                        <NavigationLabels phase={phase} />
                        {phase === Phase.LOCATION && <Location getStopById={getStopById} data={data} />}
                        {phase === Phase.IDENTIFICATION && <Identification data={data} />}
                        {phase === Phase.CONFIRMATION && <Confirmation data={data} />}
                        <NavigationButtons actions={actions} phase={phase} setPhase={setPhase} data={data} />
                    </div>
                </Pane>
            </Modal>
        </div>
    );
}