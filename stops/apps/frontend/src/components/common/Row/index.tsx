import { ReactNode } from "react";

import styles from './styles.module.css';

interface RowProps {
    children: ReactNode[];
}

export default function Row({ children }: RowProps) {
    return <div className={styles.row}>
        {children.map(child => child)}
    </div>;
}
