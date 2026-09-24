'use client';

import { IconX } from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';

import styles from './styles.module.css';

/* * */

interface BottomSheetCloseProps {
	label?: string
	onClick: () => void
	size?: 'default' | 'sm'
}

/* * */

export function BottomSheetClose({ label, onClick, size = 'default' }: BottomSheetCloseProps) {
	const { t } = useTranslation();

	return (
		<button
			aria-label={label ?? t('default:common.BottomSheetClose.label')}
			className={styles.button}
			data-size={size}
			onClick={onClick}
			type="button"
		>
			<IconX size={size === 'sm' ? 20 : 28} />
		</button>
	);
}
