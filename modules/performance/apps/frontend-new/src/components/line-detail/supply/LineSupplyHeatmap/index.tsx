/* * */

import { DashboardCard } from '@/components/common/DashboardCard';
import { usePerformanceFormatters } from '@/hooks/usePerformanceFormatters';
import { formatLineHeatmapHour, LINE_HEATMAP_DAY_IDS, LINE_HEATMAP_HOURS } from '@/utils/line-detail-heatmap';
import { type PlannedSupplyHeatmapCell } from '@tmlmobilidade/go-types-performance';
import { DataHeatmap } from '@tmlmobilidade/ui';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import styles from './styles.module.css';

/* * */

interface LineSupplyHeatmapProps { cells: PlannedSupplyHeatmapCell[] }

export function LineSupplyHeatmap({ cells }: LineSupplyHeatmapProps) {
	//

	//
	// A. Setup variables

	const { t } = useTranslation('default');
	const formatters = usePerformanceFormatters();
	const columns = LINE_HEATMAP_HOURS.map(hour => ({ id: String(hour), label: formatLineHeatmapHour(hour) }));
	const rows = useMemo(() => LINE_HEATMAP_DAY_IDS.map(id => ({ id, label: t(`lineDetail.reliabilityHeatmap.days.${id}`) })), [t]);
	const heatmapCells = cells.map(cell => ({ columnId: String(cell.hour), rowId: LINE_HEATMAP_DAY_IDS[cell.day_of_week - 1], value: cell.average_scheduled_rides }));

	//
	// B. Render components

	return (
		<DashboardCard
			description={t('lineDetail.plannedSupply.heatmap.description')}
			title={t('lineDetail.plannedSupply.heatmap.title')}
		>
			{cells.length ? <DataHeatmap ariaLabel={t('lineDetail.plannedSupply.heatmap.ariaLabel')} cellLayout="square" cells={heatmapCells} columns={columns} formatValue={formatters.decimal} rows={rows} scale="quantity" /> : <p className={styles.empty}>{t('lineDetail.plannedSupply.unavailable')}</p>}
		</DashboardCard>
	);

	//
}
