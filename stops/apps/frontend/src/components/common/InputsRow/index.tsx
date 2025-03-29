import { ReactNode } from "react";

import styles from './styles.module.css';

interface InputsRowProps {
    children: ReactNode[];
}

export default function InputsRow({ children }: InputsRowProps) {
    return <div className={styles.row}>
        {children.map(child => child)}
    </div>;
}
