'use client';

import { IconX } from '@tabler/icons-react';

import styles from './styles.module.css';

/* * */

interface BottomSheetCloseProps {
	label?: string
	onClick: () => void
	size?: 'default' | 'sm'
}

/* * */

export function BottomSheetClose({ label = 'Fechar', onClick, size = 'default' }: BottomSheetCloseProps) {
	return (
		<button
			aria-label={label}
			className={styles.button}
			data-size={size}
			onClick={onClick}
			type="button"
		>
			<IconX size={size === 'sm' ? 20 : 28} />
		</button>
	);
}
