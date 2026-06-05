'use client';

import { IconX } from '@tabler/icons-react';

import styles from './styles.module.css';

/* * */

interface BottomSheetCloseProps {
	onClick: () => void
}

export function BottomSheetClose({ onClick }: BottomSheetCloseProps) {
	return (
		<div className={styles.button} onClick={onClick}>
			<IconX size={30} />
		</div>
	);
}
