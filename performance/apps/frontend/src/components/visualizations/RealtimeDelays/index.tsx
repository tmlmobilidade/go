'use client';

/* * */

import { KpiCard } from '@/components/layout/KpiCard';
import { KpiCardSkeleton } from '@/components/layout/KpiCardSkeleton';
import { OperatorType } from '@/constants';
import { useHomeContext } from '@/contexts/Home.context';
import { MetricsRoutes } from '@/routes';
import { IconClock } from '@tabler/icons-react';
import { type RealtimeDelays } from '@tmlmobilidade/types';
import { useMemo } from 'react';
import useSWR from 'swr';

import styles from './styles.module.css';

/* * */

export function RealtimeDelays({ operator }: { operator?: OperatorType }) {
	//

	// A. Setup variables

	const homeContext = useHomeContext();
	const selectedOperator = operator || homeContext.data.selected_operator;

	// B. Fetch data

	const { data } = useSWR<RealtimeDelays[]>(MetricsRoutes.REALTIME_DELAYS);

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
				lastWeek: operatorData.total_rides.last_week,
				now: operatorData.total_rides.now,
			},
		};
	}, [data, selectedOperator]);

	//
	// D. Render components

	return (
		<>
			{!data ? <KpiCardSkeleton height={190} />
				: (
					<div className={styles.fadeIn}>
						<KpiCard
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
