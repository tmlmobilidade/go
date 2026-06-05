'use client';

import { LiveIcon } from '@/components/common/display/LiveIcon';
import { useTranslation } from 'react-i18next';

import styles from './styles.module.css';

/* * */

interface VehiclesCounterProps {
	count?: number
}

export function VehiclesCounter({ count }: VehiclesCounterProps) {
	//

	//
	// A. Setup variables

	const { t } = useTranslation();

	//
	// B. Render components

	return (
		<div className={styles.container} data-zero-count={!count}>
			<LiveIcon color={!count ? 'var(--color-system-text-300)' : 'var(--color-status-success-primary)'} />
			<p className={styles.label}>{t('default:vehicles.VehiclesCounter.label', '', { count })}</p>
		</div>
	);
}
