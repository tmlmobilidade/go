"use client";

import { ReactNode } from 'react';

import { Modal } from '@mantine/core';

import styles from './styles.module.css';

interface PatternsModalProps {
    title: string;
    patternIds: string[];
    opened: boolean;
    onClose: () => void;
    children: ReactNode
}

export default function Header({ title, patternIds, opened, onClose, children }: PatternsModalProps) {
    console.log("--> patternIds", patternIds);

    return (<Modal opened={opened} onClose={onClose} title={title}>
        {/* Modal content */}
        {children}
    </Modal>);
}


