'use client';

/* * */

import { MetricSummaryCard } from '@/components/common/MetricSummaryCard';
import { usePerformanceFormatters } from '@/hooks/usePerformanceFormatters';
import { usePulseData } from '@/hooks/usePulseData';
import { Skeleton } from '@tmlmobilidade/ui';
import { useTranslation } from 'react-i18next';

import styles from './styles.module.css';

/* * */

function getWeekdayLabel(date: string, locale: string) {
	const parsed = new Date(`${date}T12:00:00`);
	return new Intl.DateTimeFormat(locale, { weekday: 'long' }).format(parsed);
}

export function PulseView() {
	const { t } = useTranslation('default');
	const formatters = usePerformanceFormatters();
	const pulse = usePulseData();
	const baselineSampleSize = pulse.data.demand?.meta.baseline_sample_size ?? pulse.data.operational?.meta.baseline_sample_size ?? 0;
	const weekday = getWeekdayLabel(pulse.meta.operationalDate, formatters.locale);
	const baselineFootnote = baselineSampleSize > 0 && baselineSampleSize < 8
		? t('pulse.baselineFootnote', { count: baselineSampleSize, weekday })
		: t('filters.comparison.equivalentDescription');

	if (pulse.flags.is_loading) {
		return (
			<div className={styles.root}>
				<Skeleton className={styles.loadingCard} />
				<Skeleton className={styles.loadingCard} />
			</div>
		);
	}

	const demandDelta = pulse.data.demand?.delta.passenger_demand;
	const serviceDelta = pulse.data.operational?.delta_pp.service;
	const delaysDelta = pulse.data.operational?.delta_pp.delays;
	const advancesDelta = pulse.data.operational?.delta_pp.advances;

	return (
		<div className={styles.root}>
			<header className={styles.header}>
				<h1>{t('pulse.title')}</h1>
				<p>{t('pulse.subtitle')}</p>
				<small>{baselineFootnote}</small>
			</header>

			<div className={styles.grid}>
				<MetricSummaryCard
					comparisonLabel={baselineFootnote}
					title={t('pulse.demand.title')}
					trend={{ format: 'compact', value: demandDelta }}
					value={pulse.data.demand?.current.passenger_demand ?? 0}
					valueFormat="compact"
				/>
				<MetricSummaryCard
					comparisonLabel={baselineFootnote}
					title={t('pulse.operational.service')}
					trend={{ format: 'percentage-points', value: serviceDelta }}
					value={pulse.data.operational?.current.service_pct}
					valueFormat="percentage"
				/>
				<MetricSummaryCard
					comparisonLabel={baselineFootnote}
					title={t('pulse.operational.delays')}
					trend={{ format: 'percentage-points', positiveWhenIncreasing: false, value: delaysDelta }}
					value={pulse.data.operational?.current.delays_pct}
					valueFormat="percentage"
				/>
				<MetricSummaryCard
					comparisonLabel={baselineFootnote}
					title={t('pulse.operational.advances')}
					trend={{ format: 'percentage-points', positiveWhenIncreasing: false, value: advancesDelta }}
					value={pulse.data.operational?.current.advances_pct}
					valueFormat="percentage"
				/>
			</div>

			{(pulse.flags.has_demand_error || pulse.flags.has_operational_error) && (
				<p className={styles.error}>{t('pulse.error')}</p>
			)}
		</div>
	);
}

/* * */
