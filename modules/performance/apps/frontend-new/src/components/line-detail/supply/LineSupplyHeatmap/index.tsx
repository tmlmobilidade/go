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

import { useLineSupplyHeatmapData } from './useLineSupplyHeatmapData';

export function LineSupplyHeatmap() {
	//

	//
	// A. Setup variables

	const { t } = useTranslation('default');
	const heatmap = useLineSupplyHeatmapData();
	const formatters = usePerformanceFormatters();
	const { cells, line } = heatmap.data;
	const columns = LINE_HEATMAP_HOURS.map(hour => ({ id: String(hour), label: formatLineHeatmapHour(hour) }));
	const rows = useMemo(() => LINE_HEATMAP_DAY_IDS.map(id => ({ id, label: t(`lineDetail.reliabilityHeatmap.days.${id}`) })), [t]);
	const heatmapCells = cells.map(cell => ({ columnId: String(cell.hour), rowId: LINE_HEATMAP_DAY_IDS[cell.day_of_week - 1], value: cell.average_scheduled_rides }));

	//
	// B. Render components

	return (
		<DashboardCard
			description={t('lineDetail.plannedSupply.heatmap.description')}
			title={t('lineDetail.plannedSupply.heatmap.title')}
			action={(
				<PerformanceCsvExportButton
					datasets={[{ rows: cells }]}
					disabled={heatmap.flags.has_error || heatmap.flags.is_loading || !cells.length}
					filenameParts={[line?.code]}
					metadata={{ line_code: line?.code, line_id: line?._id }}
					visualizationId="supply-heatmap"
				/>
			)}
		>
			{heatmap.flags.has_error ? <Alert color="red" variant="light">{t('lineDetail.plannedSupply.dashboardError')}</Alert> : heatmap.flags.is_loading ? <Skeleton height={280} /> : cells.length ? <DataHeatmap ariaLabel={t('lineDetail.plannedSupply.heatmap.ariaLabel')} cellLayout="square" cells={heatmapCells} columns={columns} formatValue={formatters.decimal} rows={rows} scale="quantity" /> : <p className={styles.empty}>{t('lineDetail.plannedSupply.unavailable')}</p>}
		</DashboardCard>
	);

	//
}
