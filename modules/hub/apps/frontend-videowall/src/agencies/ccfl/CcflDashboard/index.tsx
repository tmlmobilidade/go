'use client';

/* * */

import { AverageDelayCard } from '@/cards/AverageDelayCard';
import { DelayedServicesCard } from '@/cards/DelayedServicesCard';
import { DemandCard } from '@/cards/DemandCard';
import { DistanceCard } from '@/cards/DistanceCard';
import { ServiceFailuresCard } from '@/cards/ServiceFailuresCard';
import { Clock } from '@/components/Clock';
import { MetricGrid } from '@/components/MetricGrid';
import { useVideowallMetricsContext } from '@/contexts/VideowallMetrics.context';

/* * */

export function CcflDashboard() {
	//

	//
	// A. Setup variables

	const { data, flags } = useVideowallMetricsContext();
	const demandTimestamp = data.metrics?.meta.demand.generated_at;
	const serviceTimestamp = data.metrics?.meta.service.generated_at;

	//
	// F. Render components

	return (
		<MetricGrid layout="sixDetails">
			<DemandCard
				agencyLabel="CCFL"
				isLoading={flags.is_loading}
				isValidating={flags.is_validating}
				size="md"
				timestamp={demandTimestamp}
				value={data.metrics?.total.demand}
			/>
			<ServiceFailuresCard
				agencyLabel="CCFL"
				isLoading={flags.is_loading}
				isValidating={flags.is_validating}
				size="md"
				timestamp={serviceTimestamp}
				value={data.metrics?.total.service}
			/>
			<AverageDelayCard
				agencyLabel="CCFL"
				isLoading={flags.is_loading}
				isValidating={flags.is_validating}
				size="md"
				timestamp={serviceTimestamp}
				value={data.metrics?.total.service}
			/>
			<DelayedServicesCard
				agencyLabel="CCFL"
				isLoading={flags.is_loading}
				isValidating={flags.is_validating}
				size="md"
				timestamp={serviceTimestamp}
				value={data.metrics?.total.service}
			/>
			<DistanceCard
				agencyLabel="CCFL"
				isLoading={flags.is_loading}
				isValidating={flags.is_validating}
				size="md"
				timestamp={serviceTimestamp}
				value={data.metrics?.total.service}
			/>
			<Clock size="md" />
		</MetricGrid>
	);

	//
}
