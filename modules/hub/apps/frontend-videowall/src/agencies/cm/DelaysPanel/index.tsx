'use client';

/* * */

import { CM_AGENCIES } from '@/agencies/cm/constants';
import { AverageDelayCard } from '@/cards/AverageDelayCard';
import { DelayedServicesCard } from '@/cards/DelayedServicesCard';
import { MetricGrid } from '@/components/MetricGrid';
import { useVideowallMetricsContext } from '@/contexts/VideowallMetrics.context';

/* * */

export function DelaysPanel() {
	//

	//
	// A. Setup variables

	const { data, flags } = useVideowallMetricsContext();
	const timestamp = data.metrics?.meta.service.generated_at;

	//
	// B. Render components

	return (
		<MetricGrid layout="sixDetails">
			<AverageDelayCard
				agencyLabel="CM"
				isLoading={flags.is_loading}
				isValidating={flags.is_validating}
				size="md"
				timestamp={timestamp}
				value={data.metrics?.total.service}
			/>

			<DelayedServicesCard
				agencyLabel="CM"
				isLoading={flags.is_loading}
				isValidating={flags.is_validating}
				size="md"
				timestamp={timestamp}
				value={data.metrics?.total.service}
			/>

			{CM_AGENCIES.map(agency => (
				<DelayedServicesCard
					key={agency.agency_id}
					agencyLabel={agency.label}
					isLoading={flags.is_loading}
					isValidating={flags.is_validating}
					size="md"
					timestamp={timestamp}
					value={data.agency_metrics[agency.agency_id]?.service}
				/>
			))}
		</MetricGrid>
	);

	//
}
