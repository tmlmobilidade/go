'use client';

/* * */

import { ActionIcon } from '@mantine/core';
import { IconChevronLeft, IconX } from '@tabler/icons-react';

import styles from './styles.module.css';

/* * */

interface BackButtonProps {
	onClick?: () => void
	type?: 'back' | 'close'
}

/* * */

export function BackButton({ onClick, type = 'back' }: BackButtonProps) {
	//

	//
	// A. Handle actions

	const handleClick = () => {
		if (onClick) onClick();
	};

	//
	// B. Render components

	return (
		<ActionIcon classNames={{ root: styles.root }} onClick={handleClick} variant="subtle">
			{type === 'back' && <IconChevronLeft />}
			{type === 'close' && <IconX />}
		</ActionIcon>
	);

	//
}
