"use client";

import { useManualContext } from '@/contexts/Manual.context';

import { useDisclosure } from '@mantine/hooks';
import { Tooltip } from '@tmlmobilidade/ui';
import { IconDeviceFloppy, IconEye, IconWorldUpload, IconX } from '@tabler/icons-react';

import styles from './styles.module.css';
import PatternsModal from './PatternsModal';

export default function Header() {
    const { isManual } = useManualContext();

    const [opened, { open, close }] = useDisclosure(false);

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
                <div className={styles.icon_blue}>
                    <IconWorldUpload />
                </div>
            </Tooltip>
        </div>

        <PatternsModal opened={opened} onClose={close} title={"Patterns associados a esta paragem"} patternIds={["x", "y"]}>
            {/* Modal content */}
        </PatternsModal>
    </div >;
}


