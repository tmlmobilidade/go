'use client';

/* * */

import { MetricCardSkeleton } from '@/components/cards/MetricCardSkeleton';
import { MetricDuration } from '@/components/cards/MetricDuration';
import { MetricNumber } from '@/components/common/MetricNumber';
import { MetricTimestamp } from '@/components/common/MetricTimestamp';
import { DelayTrend } from '@/components/delays/DelayTrend';
import { IconClock } from '@tabler/icons-react';
import { type DepartureDelayTrendPoint, type DepartureDelayValue } from '@tmlmobilidade/go-types-public-info';
import { useTranslation } from 'react-i18next';

import styles from './styles.module.css';

/* * */

interface Props {
	agencyLabel?: string
	isLoading?: boolean
	isValidating?: boolean
	targetPercentage: number
	timestamp?: number
	trend?: DepartureDelayTrendPoint[]
	value: DepartureDelayValue | null | undefined
}

type DelaySentiment = 'attention' | 'healthy' | 'unavailable';

/* * */

export function DelayCard({
	agencyLabel,
	isLoading = false,
	isValidating = false,
	targetPercentage,
	timestamp,
	trend = [],
	value,
}: Props) {
	//

	//
	// A. Setup variables

	const { t } = useTranslation();
	const sentiment: DelaySentiment = value?.delay_status === 'within_target'
		? 'healthy'
		: value?.delay_status === 'above_target'
			? 'attention'
			: 'unavailable';
	const statusLabel = t(`default:videowall.delay_chart.status.${value?.delay_status ?? 'unavailable'}`);
	const titleLabel = agencyLabel
		? t('default:videowall.delay_chart.title', '', { agency: agencyLabel })
		: t('default:videowall.delay_chart.title_without_agency');

	//
	// F. Render components

	if (isLoading) return <MetricCardSkeleton />;

	return (
		<article
			aria-busy={isValidating}
			className={styles.container}
			data-sentiment={sentiment}
		>
			<header className={styles.header}>
				<div className={styles.title}>
					<IconClock />
					<h2>{titleLabel}</h2>
				</div>
				<MetricTimestamp timestamp={timestamp} />
			</header>

			<div className={styles.summary}>
				<div className={styles.primaryMetric}>
					<strong>
						<MetricNumber value={value?.delayed_more_than_five_minutes_rides_qty} />
					</strong>
					<p>{t('default:videowall.delay_chart.subtitle')}</p>
				</div>

				<div className={styles.comparison}>
					<strong>
						<MetricNumber
							decimalScale={1}
							suffix="%"
							value={value?.delayed_more_than_five_minutes_pct}
						/>
					</strong>
					<p>{t('default:videowall.delay_chart.current_percentage')}</p>
					<div className={styles.averageDelay}>
						<p>{t('default:videowall.delay_chart.average_delay')}</p>
						<strong><MetricDuration value={value?.average_start_delay_minutes} /></strong>
					</div>
					<span>{statusLabel}</span>
				</div>
			</div>

			<DelayTrend points={trend} targetPercentage={targetPercentage} />

			{!value && <p className={styles.unavailable}>{t('default:videowall.unavailable')}</p>}
		</article>
	);

	//
}
