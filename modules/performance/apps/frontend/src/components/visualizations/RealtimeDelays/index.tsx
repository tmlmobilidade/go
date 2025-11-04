'use client';

/* * */

import { MetricCard } from '@/components/layout/MetricCard';
import { MetricCardSkeleton } from '@/components/layout/MetricCardSkeleton';
import { OperatorType } from '@/constants';
import { useHomeContext } from '@/contexts/Home.context';
import { MetricsRoutes } from '@/routes';
import { IconClock } from '@tabler/icons-react';
import { type RealtimeServiceCompliance } from '@tmlmobilidade/types';
import { useMemo } from 'react';
import useSWR from 'swr';

import styles from './styles.module.css';

/* * */

// Refactor this. Currently its not being used

export function RealtimeDelays({ operator }: { operator?: OperatorType }) {
	//

	// A. Setup variables

	const homeContext = useHomeContext();
	const selectedOperator = operator || homeContext.data.selected_operator;

	// B. Fetch data

	const { data } = useSWR<RealtimeServiceCompliance[]>(MetricsRoutes.REALTIME_SERVICE_COMPLIANCE);

	//
	// C. Transform data

	const formattedData = useMemo(() => {
		if (!data?.length) {
			return {
				lastUpdated: null,
				meanDelay: {
					lastWeek: 0,
					now: 0,
				},
				totalRides: {
					lastWeek: 0,
					now: 0,
				},
			};
		}

		const latest = data[0];
		const operatorData = selectedOperator === 'all'
			? latest.data.total
			: latest.data.operators[selectedOperator];

		return {
			lastUpdated: latest.generated_at,
			meanDelay: {
				lastWeek: operatorData.mean_delay_minutes.last_week,
				now: operatorData.mean_delay_minutes.now,
			},
			totalRides: {
				lastWeek: operatorData.scheduled_rides.last_week,
				now: operatorData.scheduled_rides.now,
			},
		};
	}, [data, selectedOperator]);

	//
	// D. Render components

	return (
		<>
			{!data ? <MetricCardSkeleton height={190} />
				: (
					<div className={styles.fadeIn}>
						<MetricCard
							headerIcon={<IconClock />}
							headerTitle="Atraso médio das viagens"
							headerValue={`${formattedData.meanDelay.now.toLocaleString()} min`}
							updatedAt={new Date(formattedData.lastUpdated)}
							items={[
								{
									label: 'Semana passada à mesma hora',
									value: `${formattedData.meanDelay.lastWeek} min`,
								},
								{
									isDelta: true,
									label: 'Variação',
									value: -((formattedData.meanDelay.now / formattedData.meanDelay.lastWeek) - 1) * 100,
								},
							]}
						/>
					</div>
				)}
		</>
	);
}
