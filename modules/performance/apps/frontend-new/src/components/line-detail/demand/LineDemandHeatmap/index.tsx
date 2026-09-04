'use client';

/* * */

import { DashboardCard } from '@/components/common/DashboardCard';
import { PerformanceCsvExportButton } from '@/components/common/PerformanceCsvExportButton';
import { usePerformanceFormatters } from '@/hooks/usePerformanceFormatters';
import { formatLineHeatmapHour, LINE_HEATMAP_DAY_IDS, LINE_HEATMAP_HOURS } from '@/utils/line-detail-heatmap';
import { Alert, DataHeatmap, Skeleton } from '@tmlmobilidade/ui';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import styles from './styles.module.css';

import { useLineDemandHeatmapData } from './useLineDemandHeatmapData';

/* * */

export function LineDemandHeatmap() {
	//

	//
	// A. Setup variables

	const { t } = useTranslation('default');
	const heatmap = useLineDemandHeatmapData();
	const formatters = usePerformanceFormatters();
	const { cells, line, points } = heatmap.data;
	const columns = LINE_HEATMAP_HOURS.map(hour => ({ id: String(hour), label: formatLineHeatmapHour(hour) }));
	const rows = useMemo(() => LINE_HEATMAP_DAY_IDS.map(id => ({ id, label: t(`lineDetail.reliabilityHeatmap.days.${id}`) })), [t]);

	//
	// B. Render components

	return (
		<DashboardCard
			description={t('lineDetail.demandDashboard.heatmap.description')}
			title={t('lineDetail.demandDashboard.heatmap.title')}
			action={(
				<PerformanceCsvExportButton
					datasets={[{ rows: points }]}
					disabled={heatmap.flags.has_error || heatmap.flags.is_loading || !points.length}
					filenameParts={[line?.code]}
					metadata={{ line_code: line?.code, line_id: line?._id }}
					visualizationId="demand-heatmap"
				/>
			)}
		>
			{heatmap.flags.has_error ? <Alert color="red" variant="light">{t('lineDetail.demandDashboard.demandError')}</Alert> : heatmap.flags.is_loading ? <Skeleton height={280} /> : points.length ? (
				<DataHeatmap
					ariaLabel={t('lineDetail.demandDashboard.heatmap.ariaLabel')}
					cells={cells}
					columns={columns}
					formatValue={formatters.integer}
					rows={rows}
					scale="quantity"
				/>
			) : <p className={styles.empty}>{t('lineDetail.demandDashboard.unavailable')}</p>}
		</DashboardCard>
	);

	//
}
