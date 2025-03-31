import { ReactNode } from 'react';
import styles from './styles.module.css';

interface ItemProps {
    label: string;
    type: string;
    value: string;
    placeholder?: string;
    children?: ReactNode;
}

export default function Item({ label, type, value, placeholder, children }: ItemProps) {
    return <div className={styles.container}>
        <div className={styles.label}>{label}</div>
        <input className={styles.input} type={type} value={value} placeholder={placeholder} readOnly />
        {children}
    </div>;
}
