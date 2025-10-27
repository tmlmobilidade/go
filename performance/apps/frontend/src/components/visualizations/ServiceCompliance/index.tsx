'use client';

/* * */

import { KpiCard } from '@/components/layout/KpiCard';
import { KpiCardSkeleton } from '@/components/layout/KpiCardSkeleton';
import { VisualizationContainer } from '@/components/layout/VisualizationContainer';
import { OperatorType } from '@/constants';
import { useHomeContext } from '@/contexts/Home.context';
import { MetricsRoutes } from '@/routes';
import { IconBus } from '@tabler/icons-react';
import { RealtimeServiceCompliance } from '@tmlmobilidade/types';
import { Grid, SemiCircleProgress } from '@tmlmobilidade/ui';
import { useMemo } from 'react';
import useSWR from 'swr';

import styles from './styles.module.css';

/* * */

export function ServiceCompliance({ operator }: { operator?: OperatorType }) {
	//

	// A. Setup variables

	const homeContext = useHomeContext();
	const selectedOperator = operator || homeContext.data.selected_operator;

	const COMPLIANCE_TARGET_VALUE = 95;

	// B. Fetch data

	const { data } = useSWR<RealtimeServiceCompliance[]>(MetricsRoutes.REALTIME_SERVICE_COMPLIANCE);

	//
	// C. Transform data

	const formattedData = useMemo(() => {
		if (!data?.length) {
			return {
				lastUpdated: null,
				ridesWithSales: 0,
				scheduledRides: 0,
				validRides: 0,
			};
		}

		const latest = data[0];

		const operatorData = selectedOperator === 'all'
			? latest.data.total
			: latest.data.operators[selectedOperator];

		return {
			lastUpdated: new Date(latest.generated_at),
			ridesWithSales: operatorData.rides_with_sales,
			ridesWithSalesPct: ((operatorData.rides_with_sales / operatorData.scheduled_rides) * 100),
			scheduledRides: operatorData.scheduled_rides,
			validRides: operatorData.valid_rides,
			validRidesPct: ((operatorData.valid_rides / operatorData.scheduled_rides) * 100),
			validRidesTarget: (COMPLIANCE_TARGET_VALUE - ((operatorData.valid_rides / operatorData.scheduled_rides) * 100)),
		};
	}, [data, selectedOperator]);

	//
	// D. Render components

	if (!data) {
		return <KpiCardSkeleton height={190} />;
	}

	return (
		<div className={styles.fadeIn}>
			<VisualizationContainer height="100%" title="Conformidade do Serviço" updatedAt={formattedData.lastUpdated}>

				<div style={{ alignItems: 'center', display: 'flex', gap: '32px', height: '100%', justifyContent: 'space-between' }}>
					<div style={{ alignItems: 'center', display: 'flex', flexDirection: 'column', gap: '16px' }}>
						<SemiCircleProgress
							fillDirection="left-to-right"
							filledSegmentColor={formattedData.validRidesTarget < 0 ? 'var(--color-status-success-primary)' : 'var(--color-status-warning-primary)'}
							label={`${formattedData.validRidesPct.toFixed(1)}%`}
							orientation="up"
							size={300}
							thickness={30}
							value={Number(formattedData.validRidesPct)}
							styles={{
								label: { fontSize: 30 },
							}}
						/>

						<p>{Math.abs(formattedData.validRidesTarget).toFixed(1)}% {formattedData.validRidesTarget < 0 ? 'acima' : 'abaixo'} do target value de <b>{COMPLIANCE_TARGET_VALUE}%</b></p>
					</div>

					<Grid columns="abc" gap="lg">
						<KpiCard headerIcon={<IconBus />} headerTitle="Total de circulações previstas" headerValue={formattedData.scheduledRides} style={{ flex: 1 }} />
						<KpiCard headerTitle="Circulações válidas (3 momentos)" headerValue={formattedData.validRides} headerValueVariation={{ isPositive: formattedData.validRidesPct > COMPLIANCE_TARGET_VALUE, label: `${formattedData.validRidesPct.toFixed(1)}% do previsto`, value: formattedData.validRidesPct }} style={{ flex: 1 }} />
						<KpiCard headerTitle="Circulações com bilhética" headerValue={formattedData.ridesWithSales} headerValueVariation={{ isPositive: formattedData.ridesWithSalesPct > COMPLIANCE_TARGET_VALUE, label: `${formattedData.ridesWithSalesPct.toFixed(1)}% do previsto`, value: formattedData.ridesWithSalesPct }} style={{ flex: 1 }} />
					</Grid>
				</div>

			</VisualizationContainer>
		</div>
	);
}
