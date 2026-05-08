'use client';

import { MetricCardSkeleton } from '@/components/layout/MetricCardSkeleton';
import { VisualizationWrapper } from '@/components/layout/VisualizationWrapper';
import { AgencyTypeWithAll } from '@/constants';
import { useHomeContext } from '@/contexts/Home.context';
import { MetricsRoutes } from '@/routes';
import { type RealtimeDemand, TopDemandByAgency } from '@tmlmobilidade/types';
import { Progress, Tooltip } from '@tmlmobilidade/ui';
import { useTranslations } from 'next-intl';
import { useMemo } from 'react';
import useSWR from 'swr';

import styles from './styles.module.css';

/* * */

export function RecordDemand({ agency }: { agency?: AgencyTypeWithAll }) {
	//

	// A. Setup variables

	const t = useTranslations();
	const homeContext = useHomeContext();
	const selectedAgency = agency || homeContext.data.selected_agency;

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
		const currentData = selectedAgency === 'all'
			? realtimeLatest.data.total
			: realtimeLatest.data.agencies?.[selectedAgency];

		if (!currentData) return null;

		// Get record data
		const recordData = selectedAgency === 'all'
			? topDemandLatest.data.total
			: topDemandLatest.data.agencies?.[selectedAgency];

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
	}, [realtimeDemand, topDemandByAgency, selectedAgency]);

	// D. Render components
	if (!formattedData) {
		return <MetricCardSkeleton height={100} />;
	}

	const { progressPercentage, recordPassengers } = formattedData;

	// calcular recordes de dias uteis e fins de semana
	return (
		<VisualizationWrapper
			border="none"
			padding="0"
			title={(
				<>
					Recorde de passageiros diário: <strong>{recordPassengers.qty.toLocaleString('pt-PT')}</strong> ({t('dates.formatted', { date: recordPassengers.date })})
				</>
			)}
		>
			<div className={styles.progressContainer}>
				<Progress.Root size={30} w="100%">
					<Tooltip label={`${getTooltipLabel(progressPercentage)} (${progressPercentage.toFixed(1)}%)`}>
						<Progress.Section
							color="var(--color-primary)"
							value={progressPercentage}
							animated
						>
							<Progress.Label styles={{ label: { fontSize: 'var(--font-size-md)' } }}>{`${progressPercentage.toFixed(1)}%`}</Progress.Label>
						</Progress.Section>
					</Tooltip>
				</Progress.Root>
			</div>
		</VisualizationWrapper>
	);
}
