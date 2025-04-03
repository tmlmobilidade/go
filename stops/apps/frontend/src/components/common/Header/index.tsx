"use client";

import styles from './styles.module.css';

interface HeaderProps {
    title: string;
    description: string;
}

export default function Header({ title, description }: HeaderProps) {
    return <div className={styles.container}>
        <h3>{title}</h3>
        <p>{description}</p>
    </div>;
}
