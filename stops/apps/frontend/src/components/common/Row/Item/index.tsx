import { ReactNode } from 'react';
import styles from './styles.module.css';

interface ItemProps {
    label: string;
    type: string;
    value: string;
    children?: ReactNode
}

export default function Item({ label, type, value, children }: ItemProps) {
    return <div className={styles.container}>
        <div className={styles.label}>{label}</div>
        <input className={styles.input} type={type} value={value} readOnly />
        {children}
    </div>;
}
