/* * */

import { MetricCardSkeleton } from '@/components/MetricCardSkeleton';
import { MetricTimestamp } from '@/components/MetricTimestamp';
import { type ReactNode } from 'react';

import styles from './styles.module.css';

/* * */

export type MetricCardSentiment = 'bad' | 'good' | 'normal';
export type MetricCardSize = 'lg' | 'md' | 'sm';

interface Props {
	icon?: ReactNode
	isLoading?: boolean
	isUnavailable?: boolean
	isValidating?: boolean
	sentiment?: MetricCardSentiment
	size: MetricCardSize
	timestamp?: number
	title: string
	valuePrimary: ReactNode
	valueSecondary?: ReactNode
}

/* * */

export function MetricCard({
	icon,
	isLoading = false,
	isUnavailable = false,
	isValidating = false,
	sentiment = 'normal',
	size,
	timestamp,
	title,
	valuePrimary,
	valueSecondary,
}: Props) {
	//

	//
	// A. Render components

	if (isLoading) {
		return <MetricCardSkeleton />;
	}

	return (
		<article
			aria-busy={isValidating}
			className={styles.container}
			data-sentiment={sentiment}
			data-size={size}
			data-unavailable={isUnavailable}
		>
			<div className={styles.header}>
				{icon && <div className={styles.icon}>{icon}</div>}
				<p className={styles.title}>{title}</p>
			</div>

			<div className={styles.content}>
				<div className={styles.primary}>{valuePrimary}</div>
				{valueSecondary !== undefined && <div className={styles.secondary}>{valueSecondary}</div>}
			</div>

			<div className={styles.footer}>
				<MetricTimestamp timestamp={timestamp} />
			</div>
		</article>
	);

	//
}
