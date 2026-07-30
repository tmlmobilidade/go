'use client';

/* * */

import { CM_AGENCIES } from '@/agencies/cm/constants';
import { DistanceCard } from '@/cards/DistanceCard';
import { MetricGrid } from '@/components/cards/MetricGrid';
import { Clock } from '@/components/common/Clock';
import { useVideowallMetricsContext } from '@/contexts/VideowallMetrics.context';

/* * */

export function DistancePanel() {
	//

	//
	// A. Setup variables

	const { data, flags } = useVideowallMetricsContext();
	const timestamp = data.metrics?.meta.service.generated_at;

	//
	// B. Render components

	return (
		<MetricGrid layout="sixDetails">
			{CM_AGENCIES.map(agency => (
				<DistanceCard
					key={agency.agency_id}
					agencyLabel={agency.label}
					isLoading={flags.is_loading}
					isValidating={flags.is_validating}
					size="md"
					timestamp={timestamp}
					value={data.agency_metrics[agency.agency_id]?.service}
				/>
			))}

			<DistanceCard
				agencyLabel="CM"
				isLoading={flags.is_loading}
				isValidating={flags.is_validating}
				size="md"
				timestamp={timestamp}
				value={data.metrics?.total.service}
			/>

			<Clock size="md" />
		</MetricGrid>
	);

	//
}
