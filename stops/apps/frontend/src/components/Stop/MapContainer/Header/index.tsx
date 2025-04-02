import { Button, Tooltip } from '@tmlmobilidade/ui';

import styles from './styles.module.css';
import { IconDots, IconX } from '@tabler/icons-react';

export default function Header() {
    return <div className={styles.header}>
        {/* Settings Button */}
        {/* <div className={styles.icon} onClick={() => setIsOpen((isOpen: boolean) => !isOpen)}>
            <IconDots />
            {isOpen && <Breadcrumbs className={styles.breadcrumbs}>{items}</Breadcrumbs>}
        </div> */}

        {/* Close Button */}
        <Tooltip label={"Fechar"} position={"bottom"}>
            <div className={styles.icon}>
                <IconX />
            </div>
        </Tooltip>

        {/* Label */}
        <h3>Rua Carlos Manuel Rodrigues Francisco (Escola)</h3>

        <Button></Button>

        <Button></Button>
    </div>;
}


