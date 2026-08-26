/* * */

import { DashboardCard } from '@/components/common/DashboardCard';
import { createDemandHeatmapCells } from '@/components/line-detail/demand/LineDemandHeatmap/metrics';
import { usePerformanceFormatters } from '@/hooks/usePerformanceFormatters';
import { formatLineHeatmapHour, LINE_HEATMAP_DAY_IDS, LINE_HEATMAP_HOURS } from '@/utils/line-detail-heatmap';
import { type PassengerDemandOverTimePoint } from '@tmlmobilidade/go-types-performance';
import { DataHeatmap } from '@tmlmobilidade/ui';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import styles from './styles.module.css';

/* * */

interface LineDemandHeatmapProps {
	points: PassengerDemandOverTimePoint[]
}

/* * */

export function LineDemandHeatmap({ points }: LineDemandHeatmapProps) {
	//

	//
	// A. Setup variables

	const { t } = useTranslation('default');
	const formatters = usePerformanceFormatters();
	const columns = LINE_HEATMAP_HOURS.map(hour => ({ id: String(hour), label: formatLineHeatmapHour(hour) }));
	const rows = useMemo(() => LINE_HEATMAP_DAY_IDS.map(id => ({ id, label: t(`lineDetail.reliabilityHeatmap.days.${id}`) })), [t]);
	const cells = useMemo(() => createDemandHeatmapCells(points), [points]);

	//
	// B. Render components

	return (
		<DashboardCard
			description={t('lineDetail.demandDashboard.heatmap.description')}
			title={t('lineDetail.demandDashboard.heatmap.title')}
		>
			{points.length ? (
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
