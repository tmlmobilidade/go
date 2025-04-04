"use client";

import { useManualContext } from '@/contexts/Manual.context';
import { useStopsContext } from '@/contexts/Stops.context';

import { Stop } from '@carrismetropolitana/api-types/network';

import { useDisclosure } from '@mantine/hooks';

import List from '../List';
import Item from '../List/Item';
import Right from './Right';
import Left from './Left';

import PatternsModal from '../PatternsModal';

import styles from './styles.module.css';

export default function GenericHeader() {
    // Contexts
    const { isManual } = useManualContext();
    const { actions } = useStopsContext();

    // Hooks
    const [opened, { open, close }] = useDisclosure(false);

    const stopId: string = "010001";

    // Stop
    const stop: Stop = actions.getStopById(stopId);

    return <div className={styles.header}>
        <Left isManual={isManual} long_name={stop?.long_name} />

        <Right stopId={stopId} open={open} />

        <PatternsModal opened={opened} onClose={close} title={"Patterns associados a esta paragem"}>
            {/* Modal content */}
            <List>
                {stop?.pattern_ids.map((id) => <Item key={id} id={id} />)}
            </List>
        </PatternsModal>
    </div >;
}