'use client';

import { IconArrowLeft } from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';

import styles from './styles.module.css';

/* * */

interface BottomSheetBackProps {
	onClick: () => void
}

/* * */

export function BottomSheetBack({ onClick }: BottomSheetBackProps) {
	const { t } = useTranslation();

	return (
		<button
			aria-label={t('default:common.BottomSheetBack.label')}
			className={styles.button}
			onClick={onClick}
			type="button"
		>
			<IconArrowLeft aria-hidden={true} size={26} stroke={2} />
		</button>
	);
}
