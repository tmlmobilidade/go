'use client';

/* * */

import { CM_AGENCIES } from '@/agencies/cm/constants';
import { DemandCard } from '@/cards/DemandCard';
import { MetricGrid } from '@/components/cards/MetricGrid';
import { useVideowallMetricsContext } from '@/contexts/VideowallMetrics.context';

/* * */

export function DemandPanel() {
	//

	//
	// A. Setup variables

	const { data, flags } = useVideowallMetricsContext();
	const timestamp = data.demand_metrics?.meta.generated_at ?? data.metrics?.meta.demand.generated_at;
	const totalDemand = data.demand_metrics?.total.value ?? data.metrics?.total.demand;

	//
	// B. Render components

	return (
		<MetricGrid layout="primaryWithFourDetails">
			<DemandCard
				agencyLabel="CM"
				isLoading={flags.is_demand_loading}
				isValidating={flags.is_demand_validating}
				size="lg"
				timestamp={timestamp}
				trend={data.demand_metrics?.total.trend}
				value={totalDemand}
			/>

			{CM_AGENCIES.map(agency => (
				<DemandCard
					key={agency.agency_id}
					agencyLabel={agency.label}
					isLoading={flags.is_demand_loading}
					isValidating={flags.is_demand_validating}
					size="md"
					timestamp={timestamp}
					trend={data.demand_agency_metrics[agency.agency_id]?.trend}
					value={data.demand_agency_metrics[agency.agency_id]?.value ?? data.agency_metrics[agency.agency_id]?.demand}
				/>
			))}
		</MetricGrid>
	);

	//
}
