import styles from './styles.module.css';

interface ItemProps {
    label: string;
    type: string;
    value: string;
}

export default function Item({ label, type, value }: ItemProps) {
    return <div className={styles.container}>
        <div className={styles.label}>{label}</div>
        <input className={styles.input} type={type} value={value} readOnly />
    </div>;
}
