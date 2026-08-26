'use client';

/* * */

import { DashboardCard } from '@/components/common/DashboardCard';
import { createDemandHeatmapCells } from '@/components/line-detail/demand/LineDemandHeatmap/metrics';
import { usePerformanceFormatters } from '@/hooks/usePerformanceFormatters';
import { formatLineHeatmapHour, LINE_HEATMAP_DAY_IDS, LINE_HEATMAP_HOURS } from '@/utils/line-detail-heatmap';
import { type PassengerDemandOverTimePoint, type RidePerformanceHeatmapCell } from '@tmlmobilidade/go-types-performance';
import { Alert, DataHeatmap, type HeatmapLegendItem, Select, Skeleton } from '@tmlmobilidade/ui';
import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

import styles from './styles.module.css';

import { createOperationalHeatmapCells, getLineHeatmapTone, type LineOverviewReliabilityHeatmapMetric } from './metrics';

/* * */

const SEMANTIC_TONES = ['positive', 'low', 'medium', 'high', 'critical'] as const;
interface LineOverviewReliabilityHeatmapProps {
	demandPoints: PassengerDemandOverTimePoint[]
	hasDemandError: boolean
	hasOperationalError: boolean
	isDemandLoading: boolean
	isOperationalLoading: boolean
	operationalCells: RidePerformanceHeatmapCell[]
}

/* * */

export function LineOverviewReliabilityHeatmap({
	demandPoints,
	hasDemandError,
	hasOperationalError,
	isDemandLoading,
	isOperationalLoading,
	operationalCells,
}: LineOverviewReliabilityHeatmapProps) {
	//

	//
	// A. Setup variables

	const { t } = useTranslation('default');
	const formatters = usePerformanceFormatters();
	const [metric, setMetric] = useState<LineOverviewReliabilityHeatmapMetric>('delays');
	const columns = LINE_HEATMAP_HOURS.map(hour => ({ id: String(hour), label: formatLineHeatmapHour(hour) }));
	const rows = useMemo(() => LINE_HEATMAP_DAY_IDS.map(id => ({ id, label: t(`lineDetail.reliabilityHeatmap.days.${id}`) })), [t]);
	const metricOptions = useMemo(() => (['validations', 'service', 'delays', 'advances'] as const).map(value => ({
		label: t(`lineDetail.reliabilityHeatmap.metrics.${value}.label`),
		value,
	})), [t]);

	//
	// B. Transform data

	const cells = useMemo(
		() => metric === 'validations' ? createDemandHeatmapCells(demandPoints) : createOperationalHeatmapCells(operationalCells, metric),
		[demandPoints, metric, operationalCells],
	);
	const legend = metric === 'validations' ? undefined : SEMANTIC_TONES.map<HeatmapLegendItem>((tone, index) => ({
		label: t(`lineDetail.reliabilityHeatmap.metrics.${metric}.legend.${index + 1}`),
		tone,
	}));
	const metricLabel = t(`lineDetail.reliabilityHeatmap.metrics.${metric}.label`);
	const hasError = metric === 'validations' ? hasDemandError : hasOperationalError;
	const isLoading = metric === 'validations' ? isDemandLoading : isOperationalLoading;

	//
	// C. Handle actions

	const handleMetricChange = (value: null | string) => {
		if (!value) return;
		setMetric(value as LineOverviewReliabilityHeatmapMetric);
	};

	//
	// D. Render components

	return (
		<DashboardCard
			className={styles.root}
			description={t(`lineDetail.reliabilityHeatmap.metrics.${metric}.description`)}
			title={t('lineDetail.reliabilityHeatmap.title')}
			action={(
				<div className={styles.controls}>
					<span className={styles.badge}>{t('lineDetail.reliabilityHeatmap.badge')}</span>
					<Select
						aria-label={t('lineDetail.reliabilityHeatmap.metricLabel')}
						className={styles.metricSelect}
						clearable={false}
						data={metricOptions}
						onChange={handleMetricChange}
						searchable={false}
						value={metric}
					/>
				</div>
			)}
		>

			{hasError ? <Alert color="red" variant="light">{t('lineDetail.reliabilityHeatmap.error')}</Alert> : isLoading ? (
				<Skeleton className={styles.loading} />
			) : (
				metric === 'validations' ? (
					<DataHeatmap
						ariaLabel={t('lineDetail.reliabilityHeatmap.ariaLabel', { metric: metricLabel })}
						cells={cells}
						columns={columns}
						formatValue={formatters.integer}
						rows={rows}
						scale="quantity"
					/>
				) : (
					<DataHeatmap
						ariaLabel={t('lineDetail.reliabilityHeatmap.ariaLabel', { metric: metricLabel })}
						cells={cells}
						columns={columns}
						formatValue={value => formatters.ratio(value / 100)}
						getTone={value => getLineHeatmapTone(metric, value)}
						legend={legend}
						rows={rows}
					/>
				)
			)}
		</DashboardCard>
	);

	//
}
