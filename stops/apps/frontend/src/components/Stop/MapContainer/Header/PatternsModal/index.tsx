"use client";

import { ReactNode } from 'react';

import { Modal } from '@mantine/core';

interface PatternsModalProps {
    title: string;
    opened: boolean;
    onClose: () => void;
    children: ReactNode
}

export default function Header({ title, opened, onClose, children }: PatternsModalProps) {
    return (<Modal opened={opened} onClose={onClose} title={title}>
        {children}
    </Modal>);
}


