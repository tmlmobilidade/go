'use client';

import { MetricCard } from '@/components/layout/MetricCard';
import { DemandVisualization } from '@/components/visualizations/Demand/DemandVisualization';
import { RecordDemand } from '@/components/visualizations/RecordDemand';
import { type AgencyType } from '@/constants';
import { useHomeContext } from '@/contexts/Home.context';
import { useRealtimeDemandData } from '@/hooks/use-realtime-demand-data';
import { getMetricAgencyData } from '@/utils/agencies';
import { IconUser } from '@tabler/icons-react';
import { useMemo } from 'react';

import styles from './styles.module.css';

/* * */

export function RealtimeDemand({ agency }: { agency?: AgencyType }) {
	//

	//
	// A. Setup variables

	const homeContext = useHomeContext();
	const selectedAgency = agency || homeContext.data.selected_agency;

	//
	// B. Fetch data

	const { data, isLoading } = useRealtimeDemandData();

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

		const agenciesData = selectedAgency === 'all'
			? latest.data.total
			: getMetricAgencyData(latest.data.agencies, selectedAgency);

		const now = agenciesData?.now ?? 0;
		const lastWeek = agenciesData?.last_week ?? 0;
		const progress = lastWeek > 0 ? (now / lastWeek) * 100 : 0;

		return {
			lastUpdated: latest.generated_at,
			lastWeek,
			now,
			progress,
		};
	}, [data, selectedAgency]);

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
						<RecordDemand agency={selectedAgency} />
						<DemandVisualization
							filters={{ agencyIds: agency ? [agency] : undefined }}
							groupBy="agency"
							height={150}
							timeView="daily"
						/>
					</div>
				</MetricCard>
			</div>
		</>
	);
}

//
