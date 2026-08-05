'use client';

/* * */

import { MetricBreakdown, type MetricBreakdownItem } from '@/components/cards/MetricBreakdown';
import { MetricCardSkeleton } from '@/components/cards/MetricCardSkeleton';
import { MetricNumber } from '@/components/common/MetricNumber';
import { MetricTimestamp } from '@/components/common/MetricTimestamp';
import { VkmExecutionTrend } from '@/components/vkm/VkmExecutionTrend';
import { IconRulerMeasure } from '@tabler/icons-react';
import { type VkmExecutionTrendPoint, type VkmExecutionValue } from '@tmlmobilidade/go-types-public-info';
import { useTranslation } from 'react-i18next';

import styles from './styles.module.css';

/* * */

interface Props {
	agencyLabel?: string
	breakdown?: MetricBreakdownItem[]
	isLoading?: boolean
	isValidating?: boolean
	targetPercentage: number
	timestamp?: number
	trend?: VkmExecutionTrendPoint[]
	value: null | undefined | VkmExecutionValue
}

type VkmExecutionSentiment = 'attention' | 'healthy' | 'unavailable';

/* * */

export function VkmExecutionCard({
	agencyLabel,
	breakdown,
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
	const sentiment: VkmExecutionSentiment = value?.execution_status === 'within_target'
		? 'healthy'
		: value?.execution_status === 'below_target'
			? 'attention'
			: 'unavailable';
	const statusLabel = t(`default:videowall.vkm_execution_chart.status.${value?.execution_status ?? 'unavailable'}`);
	const titleLabel = agencyLabel
		? t('default:videowall.vkm_execution_chart.title', '', { agency: agencyLabel })
		: t('default:videowall.vkm_execution_chart.title_without_agency');

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
					<IconRulerMeasure />
					<h2>{titleLabel}</h2>
				</div>
				<MetricTimestamp timestamp={timestamp} />
			</header>

			<div className={styles.summary}>
				<div className={styles.primaryMetric}>
					<strong>
						<MetricNumber value={value?.executed_distance_km} />
						<small>km</small>
					</strong>
					<p>{t('default:videowall.vkm_execution_chart.subtitle')}</p>
				</div>

				<div className={styles.comparison}>
					<strong>
						<MetricNumber decimalScale={1} suffix="%" value={value?.execution_pct} />
					</strong>
					<p>{t('default:videowall.vkm_execution_chart.current_execution')}</p>
					<span>{statusLabel}</span>
				</div>
			</div>

			<VkmExecutionTrend points={trend} targetPercentage={targetPercentage} />

			{breakdown && <MetricBreakdown items={breakdown} />}

			{!value && <p className={styles.unavailable}>{t('default:videowall.unavailable')}</p>}
		</article>
	);

	//
}
