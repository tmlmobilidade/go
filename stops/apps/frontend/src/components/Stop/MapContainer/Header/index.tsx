"use client";

import SpecificHeader from './SpecificHeader';
import GenericHeader from './GenericHeader';

import styles from './styles.module.css';


interface HeaderProps {
    generic?: boolean;
}

export default function Header({ generic }: HeaderProps) {
    return <div className={styles.header}>
        {generic ? <GenericHeader /> : <SpecificHeader />}
    </div >;
}


