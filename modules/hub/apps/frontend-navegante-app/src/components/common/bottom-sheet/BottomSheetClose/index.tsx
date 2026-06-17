'use client';

import { IconX } from '@tabler/icons-react';

import styles from './styles.module.css';

/* * */

interface BottomSheetCloseProps {
	onClick: () => void
	ref?: React.RefObject<HTMLDivElement>
}

export function BottomSheetClose({ onClick, ref }: BottomSheetCloseProps) {
	return (
		<div
			ref={ref}
			aria-label="Fechar"
			className={styles.button}
			onClick={onClick}
			role="button"
		>
			<IconX size={30} />
		</div>
	);
}
