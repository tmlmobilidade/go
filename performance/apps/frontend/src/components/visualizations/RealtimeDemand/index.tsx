'use client';

/* * */

import { KpiCard } from '@/components/layout/KpiCard';
import { KpiCardSkeleton } from '@/components/layout/KpiCardSkeleton';
import { OperatorType } from '@/constants';
import { useHomeContext } from '@/contexts/Home.context';
import { MetricsRoutes } from '@/routes';
import { IconUser } from '@tabler/icons-react';
import { type RealtimeDemand } from '@tmlmobilidade/types';
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

	const { data } = useSWR<RealtimeDemand[]>(MetricsRoutes.REALTIME_DEMAND);

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
			{!data ? <KpiCardSkeleton height={190} />
				: (
					<div className={styles.fadeIn}>
						<KpiCard
							headerIcon={<IconUser />}
							headerTitle="Passageiros transportados hoje"
							headerValue={formattedData.now.toLocaleString()}
							updatedAt={new Date(formattedData.lastUpdated)}
							items={[
								{
									label: `Semana passada à mesma hora`,
									value: formattedData.lastWeek.toLocaleString(),
								},
								{
									isDelta: true,
									label: `Variação`,
									value: ((formattedData.now / formattedData.lastWeek) - 1) * 100,
								},
							]}
						/>
					</div>
				)}
		</>
	);
}

//
