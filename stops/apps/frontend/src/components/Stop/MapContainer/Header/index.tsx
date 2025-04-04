"use client";

// import { useRouter } from 'next/router'

import { useManualContext } from '@/contexts/Manual.context';
import { useStopsContext } from '@/contexts/Stops.context';

import { Stop } from '@carrismetropolitana/api-types/network';

import { useDisclosure } from '@mantine/hooks';
import { Tooltip } from '@tmlmobilidade/ui';
import { IconDeviceFloppy, IconEye, IconWorldUpload, IconX } from '@tabler/icons-react';

import PatternsModal from './PatternsModal';

import styles from './styles.module.css';
import List from './List';
import Item from './List/Item';

export default function Header() {
    // Contexts
    const { isManual } = useManualContext();
    const { actions } = useStopsContext();

    // Hooks
    const [opened, { open, close }] = useDisclosure(false);

    const stopId: string = "010001";

    // Stop
    const stop: Stop = actions.getStopById(stopId);

    return <div className={styles.header}>
        <div className={styles.section}>
            {/* Manual -> Save Button */}
            {/* Automatic -> Close Button */}
            {isManual ?
                <Tooltip label={"Guardar Alterações"} position={"bottom"}>
                    <div className={styles.icon_green}>
                        <IconDeviceFloppy />
                    </div>
                </Tooltip> :
                <Tooltip label={"Fechar"} position={"bottom"}>
                    <div className={styles.icon}>
                        <IconX />
                    </div>
                </Tooltip>
            }

            {/* Label */}
            <h3>Rua Carlos Manuel Rodrigues Francisco (Escola)</h3>
        </div>

        <div className={styles.section}>
            {/* Patterns Butoon */}
            <Tooltip label={"Ver Patterns Associados"} position={"bottom"}>
                <div className={styles.icon_blue} onClick={open} color={"blue"}>
                    <IconEye />
                </div>
            </Tooltip>

            {/* Stop Button */}
            <Tooltip label={"Ver esta paragem no Site"} position={"bottom"}>
                <div
                    className={styles.icon_blue}
                    onClick={() => window.open(`https://www.carrismetropolitana.pt/stops/${stopId}`, "_blank")}
                >
                    <IconWorldUpload />
                </div>
            </Tooltip>
        </div>

        <PatternsModal opened={opened} onClose={close} title={"Patterns associados a esta paragem"}>
            {/* Modal content */}
            <List>
                {stop?.pattern_ids.map((id) => <Item key={id} id={id} />)}
            </List>
        </PatternsModal>
    </div >;
}


