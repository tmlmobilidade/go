import { ReactNode } from "react";

import styles from './styles.module.css';

interface RowProps {
    hasIcons?: boolean;
    children: ReactNode;
}

export default function Row({ hasIcons, children }: RowProps) {
    return <div className={hasIcons ? styles.row_with_icons : styles.row}>
        {children}
    </div>;
}
