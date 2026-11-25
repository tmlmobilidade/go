'use client';

import { LiveIcon, RollingNumber } from '@tmlmobilidade/ui';

import styles from './styles.module.css';

/* * */

interface LandingStatCardProps {
	isLive?: boolean
	label: string
	thousandSeparator: string
	value: number
}

/* * */

export function LandingStatCard({ isLive, label, thousandSeparator, value }: LandingStatCardProps) {
	return (
		<div className={styles.card}>
			<p className={styles.label}>
				{isLive && <LiveIcon />}
				{label}
			</p>
			<RollingNumber className={styles.value} thousandSeparator={thousandSeparator} value={value} />
		</div>
	);
}
