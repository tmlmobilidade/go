'use client';

/* * */

import { MetricCardSkeleton } from '@/components/cards/MetricCardSkeleton';
import { MetricNumber } from '@/components/common/MetricNumber';
import { MetricTimestamp } from '@/components/common/MetricTimestamp';
import { DemandRangeGauge } from '@/components/demand/DemandRangeGauge';
import { DemandTrend } from '@/components/demand/DemandTrend';
import { IconUsersGroup } from '@tabler/icons-react';
import {
	type PassengerDemandTrendPoint,
	type PassengerDemandValue,
} from '@tmlmobilidade/go-types-public-info';
import { useTranslation } from 'react-i18next';

import styles from './styles.module.css';

/* * */

interface Props {
	agencyLabel: string
	isLoading?: boolean
	isValidating?: boolean
	timestamp?: number
	trend?: PassengerDemandTrendPoint[]
	value: null | PassengerDemandValue | undefined
}

type DemandSentiment = 'bad' | 'good' | 'normal' | 'unavailable';

/* * */

export function DemandCard({
	agencyLabel,
	isLoading = false,
	isValidating = false,
	timestamp,
	trend = [],
	value,
}: Props) {
	//

	//
	// A. Setup variables

	const { t } = useTranslation();
	const sentiment: DemandSentiment = value?.deviation_status === 'below_typical'
		? 'bad'
		: value?.deviation_status === 'above_typical'
			? 'good'
			: value?.deviation_status === 'typical'
				? 'normal'
				: 'unavailable';
	const typicalComparisonIndex = value?.typical_comparison_index_pct ?? null;
	const deviationPercentage = typicalComparisonIndex === null
		? null
		: typicalComparisonIndex - 100;
	const statusLabel = t(`default:videowall.demand_chart.status.${value?.deviation_status ?? 'unavailable'}`);

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
					<IconUsersGroup />
					<h2>{t('default:videowall.demand_chart.title', '', { agency: agencyLabel })}</h2>
				</div>
				<MetricTimestamp timestamp={timestamp} />
			</header>

			<div className={styles.summary}>
				<div className={styles.primaryMetric}>
					<strong><MetricNumber value={value?.passenger_validations_qty_now} /></strong>
					<p>{t('default:videowall.demand_chart.subtitle')}</p>
				</div>

				<div className={styles.comparison}>
					<div className={styles.deviation}>
						<strong>
							<MetricNumber
								decimalScale={1}
								prefix={deviationPercentage !== null && deviationPercentage > 0 ? '+' : undefined}
								suffix="%"
								value={deviationPercentage}
							/>
						</strong>
					</div>
					<p>{t('default:videowall.demand_chart.comparison')}</p>
					<span>{statusLabel}</span>
				</div>
			</div>

			{value?.typical_range && value.typical_cumulative_qty !== null && (
				<DemandRangeGauge
					currentValue={value.completed_interval_validations_qty_now}
					referenceValue={value.typical_cumulative_qty}
					typicalRange={value.typical_range}
				/>
			)}

			<DemandTrend points={trend} />

			{!value && <p className={styles.unavailable}>{t('default:videowall.unavailable')}</p>}
		</article>
	);

	//
}
