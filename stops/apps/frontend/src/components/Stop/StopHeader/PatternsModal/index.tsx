'use client';

/* * */

import { Modal } from '@mantine/core';
import { ReactNode } from 'react';

/* * */

interface PatternsModalProps {
	children: ReactNode
	onClose: () => void
	opened: boolean
	title: string
}

/* * */

export default function Header({ children, onClose, opened, title }: PatternsModalProps) {
	//

	//
	// A. Render components

	return (
		<Modal onClose={onClose} opened={opened} title={title}>
			{children}
		</Modal>
	);
}
