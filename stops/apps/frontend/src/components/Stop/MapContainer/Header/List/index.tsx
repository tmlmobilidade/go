"use client";

import { ReactNode } from "react";

import Item from "./Item";

import styles from './styles.module.css';

export default function List({ children }: { children: ReactNode }) {
    // const { data, flags } = useStopsContext();

    return <div className={styles.container}>
        {children}
    </div>;
}
