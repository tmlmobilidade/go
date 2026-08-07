'use client';

/* * */

import { MetricBreakdown, type MetricBreakdownItem } from '@/components/cards/MetricBreakdown';
import { MetricCardSkeleton } from '@/components/cards/MetricCardSkeleton';
import { MetricNumber } from '@/components/common/MetricNumber';
import { MetricTimestamp } from '@/components/common/MetricTimestamp';
import { DemandRangeGauge } from '@/components/demand/DemandRangeGauge';
import { DemandTrend } from '@/components/demand/DemandTrend';
import { getDemandReferenceDeviationRange } from '@/utils/demand-reference-range';
import { IconUsersGroup } from '@tabler/icons-react';
import {
	type PassengerDemandTrendPoint,
	type PassengerDemandValue,
} from '@tmlmobilidade/go-types-public-info';
import { useTranslation } from 'react-i18next';

import styles from './styles.module.css';

/* * */

interface Props {
	agencyLabel?: string
	breakdown?: MetricBreakdownItem[]
	isLoading?: boolean
	isValidating?: boolean
	timestamp?: number
	trend?: PassengerDemandTrendPoint[]
	value: null | PassengerDemandValue | undefined
}

type DemandSentiment = 'attention' | 'healthy' | 'unavailable';

/* * */

function formatDeviationPercentage(value: number, locale: string) {
	const formattedValue = new Intl.NumberFormat(locale, {
		maximumFractionDigits: 1,
		minimumFractionDigits: 1,
	}).format(value);

	return `${value > 0 ? '+' : ''}${formattedValue}%`;
}

/* * */

export function DemandCard({
	agencyLabel,
	breakdown,
	isLoading = false,
	isValidating = false,
	timestamp,
	trend = [],
	value,
}: Props) {
	//

	//
	// A. Setup variables

	const { i18n, t } = useTranslation();
	const sentiment: DemandSentiment = value?.deviation_status === 'below_typical'
		? 'attention'
		: value?.deviation_status === 'above_typical'
			? 'healthy'
			: value?.deviation_status === 'typical'
				? 'healthy'
				: 'unavailable';
	const typicalComparisonIndex = value?.typical_comparison_index_pct ?? null;
	const deviationPercentage = typicalComparisonIndex === null
		? null
		: typicalComparisonIndex - 100;
	const referenceDeviationRange = getDemandReferenceDeviationRange(value);
	const referenceRangeLabel = breakdown && referenceDeviationRange
		? t('default:videowall.demand_chart.reference_percentage_range', '', {
			lower: formatDeviationPercentage(referenceDeviationRange.lower, i18n.resolvedLanguage ?? 'pt'),
			upper: formatDeviationPercentage(referenceDeviationRange.upper, i18n.resolvedLanguage ?? 'pt'),
		})
		: null;
	const statusLabel = t(`default:videowall.demand_chart.status.${value?.deviation_status ?? 'unavailable'}`);
	const titleLabel = agencyLabel
		? t('default:videowall.demand_chart.title', '', { agency: agencyLabel })
		: t('default:videowall.demand_chart.title_without_agency');

	//
	// F. Render components

	if (isLoading) return <MetricCardSkeleton />;

	return (
		<article
			aria-busy={isValidating}
			className={styles.container}
			data-layout={breakdown ? 'aggregate' : 'standard'}
			data-sentiment={sentiment}
		>
			<header className={styles.header}>
				<div className={styles.title}>
					<IconUsersGroup />
					<h2>{titleLabel}</h2>
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
					<div className={styles.status}>
						<span>{statusLabel}</span>
						{referenceRangeLabel && <small>{referenceRangeLabel}</small>}
					</div>
				</div>
			</div>

			{!breakdown && value?.typical_range && value.typical_cumulative_qty !== null && (
				<DemandRangeGauge
					currentValue={value.passenger_validations_qty_now}
					referenceValue={value.typical_cumulative_qty}
					typicalRange={value.typical_range}
				/>
			)}

			<DemandTrend points={trend} />

			{breakdown && <MetricBreakdown items={breakdown} />}

			{!value && <p className={styles.unavailable}>{t('default:videowall.unavailable')}</p>}
		</article>
	);

	//
}
