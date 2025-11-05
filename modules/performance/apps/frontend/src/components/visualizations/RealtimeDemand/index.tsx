'use client';

/* * */

import { MetricCard } from '@/components/layout/MetricCard';
import { MetricCardSkeleton } from '@/components/layout/MetricCardSkeleton';
import { DemandByAgencyByDay } from '@/components/visualizations/DemandByAgencyByDay';
import { RecordDemand } from '@/components/visualizations/RecordDemand';
import { OperatorType } from '@/constants';
import { useHomeContext } from '@/contexts/Home.context';
import { MetricsRoutes } from '@/routes';
import { IconUser } from '@tabler/icons-react';
import { type RealtimeDemand } from '@go/types';
import { Spacer } from '@tmlmobilidade/ui';
import { useMemo } from 'react';
import useSWR from 'swr';

import styles from './styles.module.css';

/* * */

export function RealtimeDemand({ operator }: { operator?: OperatorType }) {
	//

	// A. Setup variables

	const homeContext = useHomeContext();
	const selectedOperator = operator || homeContext.data.selected_operator;

	// B. Fetch data

	const { data, isLoading } = useSWR<RealtimeDemand[]>(MetricsRoutes.REALTIME_DEMAND);

	//
	// C. Transform data

	const formattedData = useMemo(() => {
		if (!data?.length) {
			return {
				lastUpdated: null,
				lastWeek: 0,
				now: 0,
				progress: 0,
			};
		}

		const latest = data[0];

		const operatorData = selectedOperator === 'all'
			? latest.data.total
			: latest.data.operators[selectedOperator];

		const now = operatorData.now;
		const lastWeek = operatorData.last_week;
		const progress = lastWeek > 0 ? (now / lastWeek) * 100 : 0;

		return {
			lastUpdated: latest.generated_at,
			lastWeek,
			now,
			progress,
		};
	}, [data, selectedOperator]);

	//
	// D. Render components

	return (
		<>
			<div className={styles.fadeIn}>
				<MetricCard
					goal="increase"
					icon={<IconUser />}
					isLoading={isLoading}
					previousValue={formattedData.lastWeek}
					title="Passageiros transportados hoje"
					updatedAt={new Date(formattedData.lastUpdated)}
					value={formattedData.now}
				>

					<div className={styles.container}>
						<RecordDemand operator={operator} />
						<Spacer size="md" />
						<DemandByAgencyByDay chartType="bar" height={200} operator={operator} />
					</div>

				</MetricCard>
			</div>
		</>
	);
}

//
