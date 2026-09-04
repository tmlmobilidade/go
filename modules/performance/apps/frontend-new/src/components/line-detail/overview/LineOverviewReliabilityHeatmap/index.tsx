'use client';

/* * */

import { DashboardCard } from '@/components/common/DashboardCard';
import { PerformanceCsvExportButton } from '@/components/common/PerformanceCsvExportButton';
import { createDemandHeatmapCells } from '@/components/line-detail/demand/LineDemandHeatmap/metrics';
import { usePerformanceFormatters } from '@/hooks/usePerformanceFormatters';
import { formatLineHeatmapHour, LINE_HEATMAP_DAY_IDS, LINE_HEATMAP_HOURS } from '@/utils/line-detail-heatmap';
import { Alert, DataHeatmap, type HeatmapLegendItem, Select, Skeleton } from '@tmlmobilidade/ui';
import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

import styles from './styles.module.css';

import { createOperationalHeatmapCells, getLineHeatmapTone, type LineOverviewReliabilityHeatmapMetric } from './metrics';
import { useLineOverviewReliabilityHeatmapData } from './useLineOverviewReliabilityHeatmapData';

/* * */

const SEMANTIC_TONES = ['positive', 'low', 'medium', 'high', 'critical'] as const;

/* * */

export function LineOverviewReliabilityHeatmap() {
	//

	//
	// A. Setup variables

	const { t } = useTranslation('default');
	const heatmap = useLineOverviewReliabilityHeatmapData();
	const formatters = usePerformanceFormatters();
	const { demandPoints, line, operationalCells } = heatmap.data;
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
	const hasError = metric === 'validations' ? heatmap.flags.has_demand_error : heatmap.flags.has_operational_error;
	const isLoading = metric === 'validations' ? heatmap.flags.is_demand_loading : heatmap.flags.is_operational_loading;
	const isExportDisabled = [
		heatmap.flags.has_demand_error,
		heatmap.flags.has_operational_error,
		heatmap.flags.is_demand_loading,
		heatmap.flags.is_operational_loading,
		!demandPoints.length && !operationalCells.length,
	].some(Boolean);

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
					<PerformanceCsvExportButton
						disabled={isExportDisabled}
						filenameParts={[line?.code]}
						metadata={{ line_code: line?.code, line_id: line?._id }}
						visualizationId="reliability-heatmap"
						datasets={[
							{ dimensions: { subject: 'passenger_demand' }, rows: demandPoints },
							{ dimensions: { subject: 'ride_performance' }, rows: operationalCells },
						]}
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
