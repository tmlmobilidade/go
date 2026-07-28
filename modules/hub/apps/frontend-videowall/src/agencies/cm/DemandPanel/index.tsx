'use client';

/* * */

import { CM_AGENCIES } from '@/agencies/cm/constants';
import { DemandCard } from '@/cards/DemandCard';
import { MetricGrid } from '@/components/MetricGrid';
import { useVideowallMetricsContext } from '@/contexts/VideowallMetrics.context';

/* * */

export function DemandPanel() {
	//

	//
	// A. Setup variables

	const { data, flags } = useVideowallMetricsContext();
	const timestamp = data.metrics?.meta.demand.generated_at;

	//
	// B. Render components

	return (
		<MetricGrid layout="primaryWithFourDetails">
			<DemandCard
				agencyLabel="CM"
				isLoading={flags.is_loading}
				isValidating={flags.is_validating}
				size="lg"
				timestamp={timestamp}
				value={data.metrics?.total.demand}
			/>

			{CM_AGENCIES.map(agency => (
				<DemandCard
					key={agency.agency_id}
					agencyLabel={agency.label}
					isLoading={flags.is_loading}
					isValidating={flags.is_validating}
					size="md"
					timestamp={timestamp}
					value={data.agency_metrics[agency.agency_id]?.demand}
				/>
			))}
		</MetricGrid>
	);

	//
}
