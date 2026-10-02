'use client';

import { IconArrowLeft } from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';

import styles from '../navigation-button.module.css';

/* * */

interface BottomSheetBackProps {
	onClick: () => void
	size?: 'default' | 'sm'
}

/* * */

export function BottomSheetBack({ onClick, size = 'default' }: BottomSheetBackProps) {
	const { t } = useTranslation();

	return (
		<button
			aria-label={t('default:common.BottomSheetBack.label')}
			className={styles.button}
			data-size={size}
			onClick={onClick}
			type="button"
		>
			<IconArrowLeft aria-hidden={true} size={size === 'sm' ? 20 : 28} stroke={2} />
		</button>
	);
}
