"use client";

import { useDisclosure } from '@mantine/hooks';
import { Modal } from '@mantine/core';
import styles from './styles.module.css';

interface PatternsModalProps {
    title: string;
    patternIds: string[];
    opened: boolean;
    onClose: () => void;
}

export default function Header({ title, patternIds, opened, onClose }: PatternsModalProps) {
    console.log("--> patternIds", patternIds);

    return (<Modal opened={opened} onClose={onClose} title={title}>
        {/* Modal content */}
    </Modal>);
}


