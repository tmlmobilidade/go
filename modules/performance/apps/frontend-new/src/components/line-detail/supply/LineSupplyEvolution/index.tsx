'use client';

/* * */

import { DashboardCard } from '@/components/common/DashboardCard';
import { PerformanceCsvExportButton } from '@/components/common/PerformanceCsvExportButton';
import { LineSupplyChart } from '@/components/line-detail/supply/LineSupplyChart';
import { Alert, SegmentedControl, Skeleton } from '@tmlmobilidade/ui';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import styles from './styles.module.css';

import { useLineSupplyEvolutionData } from './useLineSupplyEvolutionData';

type Metric = 'rides' | 'vehicleKm';

/* * */

export function LineSupplyEvolution() {
	//

	//
	// A. Setup variables

	const { t } = useTranslation('default');
	const evolution = useLineSupplyEvolutionData();
	const [metric, setMetric] = useState<Metric>('rides');
	const { comparison, comparisonLabel, current, line } = evolution.data;

	//
	// B. Render components

	return (
		<DashboardCard
			description={t('lineDetail.plannedSupply.evolution.description')}
			title={t('lineDetail.plannedSupply.evolution.title')}
			action={(
				<div className={styles.actions}>
					<SegmentedControl
						appearance="neutral"
						aria-label={t('lineDetail.plannedSupply.evolution.metricLabel')}
						data={(['rides', 'vehicleKm'] as const).map(value => ({ label: t(`lineDetail.plannedSupply.evolution.${value}`), value }))}
						onChange={value => setMetric(value as Metric)}
						size="sm"
						value={metric}
					/>
					<PerformanceCsvExportButton
						disabled={evolution.flags.has_error || evolution.flags.is_loading || !current.length}
						filenameParts={[line?.code]}
						metadata={{ line_code: line?.code, line_id: line?._id }}
						visualizationId="supply-evolution"
						datasets={[
							{ dimensions: { period_role: 'current' }, rows: current },
							{ dimensions: { period_role: 'comparison' }, rows: comparison },
						]}
					/>
				</div>
			)}
		>
			{evolution.flags.has_error ? <Alert color="red" variant="light">{t('lineDetail.plannedSupply.dashboardError')}</Alert> : evolution.flags.is_loading ? <Skeleton height={280} /> : current.length ? <LineSupplyChart comparison={comparison} comparisonLabel={comparisonLabel} current={current} metric={metric} /> : <p className={styles.empty}>{t('lineDetail.plannedSupply.unavailable')}</p>}
		</DashboardCard>
	);

	//
}
