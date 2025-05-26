'use client';

import { Modal, Button } from '@mantine/core';
import { Pane, useDisclosure } from '@tmlmobilidade/ui';
import { StopsListViewMap } from '../Stop/StopMap';
import { useStopsContext } from '@/contexts/Stops.context';
import { useStopsDetailContext } from '@/contexts/StopsDetail.context';
import { useRouter } from 'next/navigation';
import { Routes } from '@/lib/routes';
import styles from './styles.module.css';
import { Coords } from './Coords';
import { useState } from 'react';
import { NavigationButtons } from './NavigationButtons';
import { NavigationLabels } from './NavigationLabels';

export function Form() {
    const [opened, { _open, _close }] = useDisclosure(true);
    const { actions: { getStopById } } = useStopsContext();
    const { data } = useStopsDetailContext();
    const router = useRouter();
    const [lat, _setLat] = useState(1);
    const [lon, _setLon] = useState(1);

    // A. Render components
    return (
        <div>
            <Modal opened={opened} onClose={() => router.push(Routes.STOP_LIST)} title="Nova Paragem" fullScreen={true}>
                {/* Modal content */}
                <Pane>
                    <div className={styles.container}>
                        <NavigationLabels />
                        <StopsListViewMap data={data} getStopById={getStopById} />
                        <Coords lat={lat} lon={lon} municipality={null}/>
                        <NavigationButtons />     
                    </div>
                </Pane>
            </Modal>

            {/* <Button variant="default" onClick={open}>
                Open modal
            </Button> */}
        </div>
    );
}