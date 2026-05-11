'use client';

import { IndicatorChip } from '@/components/layout/IndicatorChip';
import { MetricCard } from '@/components/layout/MetricCard';
import { MetricCardSkeleton } from '@/components/layout/MetricCardSkeleton';
import { TrendChip } from '@/components/layout/TrendChip';
import { AgencyType } from '@/constants';
import { useHomeContext } from '@/contexts/Home.context';
import { MetricsRoutes } from '@/routes';
import { IconBus } from '@tabler/icons-react';
import { RealtimeServiceCompliance } from '@tmlmobilidade/types';
import { Grid, SemiCircleProgress } from '@tmlmobilidade/ui';
import { useMemo } from 'react';
import useSWR from 'swr';

import styles from './styles.module.css';

/* * */

export function ServiceCompliance({ agency }: { agency?: AgencyType }) {
	//

	// A. Setup variables

	const homeContext = useHomeContext();
	const selectedAgency = agency || homeContext.data.selected_agency;

	// B. Fetch data

	const { data, isLoading } = useSWR<RealtimeServiceCompliance[]>(MetricsRoutes.REALTIME_SERVICE_COMPLIANCE);

	//
	// C. Transform data

	const formattedData = useMemo(() => {
		if (!data?.length) {
			return {
				accomplishedRides: { last_week: 0, now: 0 },
				advancedRides: { last_week: 0, now: 0 },
				delayedRides: { last_week: 0, now: 0 },
				lastUpdated: null,
				noPassengerRides: { last_week: 0, now: 0 },
				ridesWithSales: { last_week: 0, now: 0 },
				scheduledRides: { last_week: 0, now: 0 },
				validRides: { last_week: 0, now: 0 },
				validRidesPct: 0,
			};
		}

		const latest = data[0];

		const agencyData = selectedAgency === 'all'
			? latest.data.total
			: latest.data.agencies[selectedAgency];

		const calculatePct = (part: number, total: number) => {
			return total > 0 ? (part / total) * 100 : 0;
		};

		return {
			accomplishedRides: agencyData.accomplished_rides,
			advancedRides: agencyData.advanced_rides,
			delayedRides: agencyData.five_min_delays,
			lastUpdated: new Date(latest.generated_at),
			noPassengerRides: agencyData.no_passengers_rides,
			ridesWithSales: agencyData.rides_with_sales,
			scheduledRides: agencyData.scheduled_rides,
			validRides: agencyData.valid_rides,
			validRidesPct: calculatePct(agencyData.valid_rides.now, agencyData.scheduled_rides.now),
		};
	}, [data, selectedAgency]);

	const metricsData = [
		{
			goal: 'increase' as const,
			targetRange: [90, 95] as [number, number],
			title: 'Circulações com bilhética',
			totalValue: formattedData.scheduledRides,
			value: formattedData.ridesWithSales,
		},
		{
			goal: 'decrease' as const,
			targetRange: [2, 5] as [number, number],
			title: 'Circulações sem passageiros',
			totalValue: formattedData.scheduledRides,
			value: formattedData.noPassengerRides,
		},
		{
			goal: 'decrease' as const,
			targetRange: [5, 10] as [number, number],
			title: 'Circulações atrasadas > 5 minutos',
			totalValue: formattedData.scheduledRides,
			value: formattedData.delayedRides,
		},
		{
			goal: 'decrease' as const,
			targetRange: [0, 2] as [number, number],
			title: 'Circulações adiantadas à partida',
			totalValue: formattedData.scheduledRides,
			value: formattedData.advancedRides,
		},
	];

	//
	// D. Render components

	return (
		<MetricCard goal="increase" icon={<IconBus />} isLoading={isLoading} previousValue={formattedData.accomplishedRides.last_week} title="Total de circulações realizadas" updatedAt={formattedData.lastUpdated} value={formattedData.accomplishedRides.now}>
			<div className={styles.cardsContainer}>

				<div style={{ alignItems: 'center', display: 'flex', flexDirection: 'column', gap: '16px' }}>
					<SemiCircleProgress
						fillDirection="left-to-right"
						filledSegmentColor={formattedData.validRidesPct < 90 ? 'var(--color-status-danger-primary)' : formattedData.validRidesPct < 95 ? 'var(--color-status-warning-primary)' : 'var(--color-status-success-primary)'}
						label={`${formattedData.validRidesPct.toFixed(1)}%`}
						orientation="up"
						size={250}
						thickness={30}
						value={Number(formattedData.validRidesPct)}
						styles={{
							label: { fontSize: 30, fontWeight: 700 },
						}}
					/>
					<p style={{ textAlign: 'center', width: '250px' }}>Percentagem de circulações válidas (3 momentos)</p>
				</div>

				<Grid columns="ab" gap="md">
					{metricsData.map((metric, index) => (
						<div key={index} className={styles.kpiContainer}>
							<span className={styles.kpiTitle}>{metric.title}</span>

							<div className={styles.kpiBottomContainer}>

								{!data ? <MetricCardSkeleton height={70} /> : (
									<>
										<div className={styles.kpiValueContainer}>
											<span className={styles.kpiValue}>{metric.value.now}</span>

											<IndicatorChip
												goal={metric.goal}
												targetRange={metric.targetRange}
												totalValue={metric.totalValue.now}
												value={metric.value.now}
											/>

										</div>

										<TrendChip
											comparisonPreviousValue={metric.totalValue.last_week}
											comparisonValue={metric.totalValue.now}
											goal={metric.goal}
											previousValue={metric.value.last_week}
											value={metric.value.now}
										/>
									</>

								)}
							</div>
						</div>
					))}
				</Grid>
			</div>
		</MetricCard>

	);
}
