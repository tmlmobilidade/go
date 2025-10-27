'use client';

/* * */

import { KpiCardSkeleton } from '@/components/layout/KpiCardSkeleton';
import { VisualizationContainer } from '@/components/layout/VisualizationContainer';
import { OperatorType } from '@/constants';
import { useHomeContext } from '@/contexts/Home.context';
import { MetricsRoutes } from '@/routes';
import { type RealtimeDemand, TopDemandByAgency } from '@tmlmobilidade/types';
import { Progress, Tooltip } from '@tmlmobilidade/ui';
import { useTranslations } from 'next-intl';
import { useMemo } from 'react';
import useSWR from 'swr';

import styles from './styles.module.css';

/* * */

export function RecordDemand({ operator }: { operator?: OperatorType }) {
	//

	// A. Setup variables

	const t = useTranslations();
	const homeContext = useHomeContext();
	const selectedOperator = operator || homeContext.data.selected_operator;

	// B. Fetch data

	const { data: realtimeDemand } = useSWR<RealtimeDemand[]>(MetricsRoutes.REALTIME_DEMAND);
	const { data: topDemandByAgency } = useSWR<TopDemandByAgency[]>(MetricsRoutes.TOP_DEMAND_BY_AGENCY);

	//
	// C. Transform data

	function getTooltipLabel(progress: number) {
		if (progress < 10) return t('recordProgress.0_10');
		if (progress < 25) return t('recordProgress.10_25');
		if (progress < 50) return t('recordProgress.25_50');
		if (progress < 75) return t('recordProgress.50_75');
		if (progress < 90) return t('recordProgress.75_90');
		if (progress < 100) return t('recordProgress.90_99');
		return t('recordProgress.100_plus');
	}

	const formattedData = useMemo(() => {
		if (!realtimeDemand?.length || !topDemandByAgency?.length) {
			return null;
		}

		const realtimeLatest = realtimeDemand[0];
		const topDemandLatest = topDemandByAgency[0];

		// Get current passengers
		const currentData = selectedOperator === 'all'
			? realtimeLatest.data.total
			: realtimeLatest.data.operators?.[selectedOperator];

		if (!currentData) return null;

		// Get record data
		const recordData = selectedOperator === 'all'
			? topDemandLatest.data.total
			: topDemandLatest.data.operators?.[selectedOperator];

		if (!recordData) return null;

		const currentPassengers = currentData.now;
		const recordPassengers = {
			date: new Date(recordData.day.date),
			qty: recordData.day.qty,
		};

		const progressPercentage = recordPassengers.qty > 0
			? (currentPassengers / recordPassengers.qty) * 100
			: 0;

		return {
			currentPassengers,
			progressPercentage,
			recordPassengers,
			remaining: recordPassengers.qty - currentPassengers,
		};
	}, [realtimeDemand, topDemandByAgency, selectedOperator]);

	// D. Render components
	if (!formattedData) {
		return <KpiCardSkeleton height={190} />;
	}

	const { progressPercentage, recordPassengers, remaining } = formattedData;

	return (
		<div className={styles.fadeIn}>
			<VisualizationContainer
				title={`Faltam ${remaining.toLocaleString('pt-PT')} passageiros para atingirmos o nosso recorde diário!`}
			>
				<Progress.Root size={30}>
					<Tooltip label={`${getTooltipLabel(progressPercentage)} (${progressPercentage.toFixed(2)}%)`}>
						<Progress.Section
							color="var(--color-primary)"
							value={progressPercentage}
							animated
						/>
					</Tooltip>
				</Progress.Root>

				<p style={{ color: 'var(--color-system-text-200)' }}>
					Recorde atual: {recordPassengers.qty.toLocaleString('pt-PT')} ({t('dates.formatted_short', { date: recordPassengers.date })})
				</p>
			</VisualizationContainer>
		</div>
	);
}
