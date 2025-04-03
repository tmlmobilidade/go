"use client";

import { useStopsContext } from "@/contexts/Stops.context";
import Item from "./Item";

import styles from './styles.module.css';

export default function List() {
    const { data } = useStopsContext();

    return <div className={styles.container}>
        {data.stops.map((stop, index) => (<Item key={index} stop={stop} />))}
    </div>;
}
