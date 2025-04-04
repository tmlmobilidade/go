"use client";

import { IconChevronRight } from '@tabler/icons-react';

import styles from './styles.module.css';

interface ItemProps {
    id: string;
}

export default function Item({ id }: ItemProps) {
    return <div className={styles.container}>
        {/* Left Side */}
        <div className={styles.container_info}>
            <div className={styles.details}>
                <div className={styles.id}>{id}</div>
                {/* TODO: Get Pattern Name from ID */}
                <div className={styles.name}>Alcochete | Circular</div>
            </div>
        </div>

        {/* Right Side */}
        <div className={styles.container_icon}>
            <IconChevronRight />
        </div>
    </div>;
}
