'use client';

/* * */

import { DashboardCard } from '@/components/common/DashboardCard';
import { LineSupplyChart } from '@/components/line-detail/supply/LineSupplyChart';
import { type PlannedSupplyOverTimePoint } from '@tmlmobilidade/go-types-performance';
import { SegmentedControl } from '@tmlmobilidade/ui';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import styles from './styles.module.css';

/* * */

interface LineSupplyEvolutionProps {
	comparison: PlannedSupplyOverTimePoint[]
	comparisonLabel: string
	current: PlannedSupplyOverTimePoint[]
}

type Metric = 'rides' | 'vehicleKm';

/* * */

export function LineSupplyEvolution({ comparison, comparisonLabel, current }: LineSupplyEvolutionProps) {
	//

	//
	// A. Setup variables

	const { t } = useTranslation('default');
	const [metric, setMetric] = useState<Metric>('rides');

	//
	// B. Render components

	return (
		<DashboardCard
			description={t('lineDetail.plannedSupply.evolution.description')}
			title={t('lineDetail.plannedSupply.evolution.title')}
			action={(
				<SegmentedControl
					appearance="neutral"
					aria-label={t('lineDetail.plannedSupply.evolution.metricLabel')}
					data={(['rides', 'vehicleKm'] as const).map(value => ({ label: t(`lineDetail.plannedSupply.evolution.${value}`), value }))}
					onChange={value => setMetric(value as Metric)}
					size="sm"
					value={metric}
				/>
			)}
		>
			{current.length ? <LineSupplyChart comparison={comparison} comparisonLabel={comparisonLabel} current={current} metric={metric} /> : <p className={styles.empty}>{t('lineDetail.plannedSupply.unavailable')}</p>}
		</DashboardCard>
	);

	//
}
