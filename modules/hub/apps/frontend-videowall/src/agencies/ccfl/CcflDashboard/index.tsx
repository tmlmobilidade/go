'use client';

/* * */

import { AverageDelayCard } from '@/cards/AverageDelayCard';
import { DelayedServicesCard } from '@/cards/DelayedServicesCard';
import { DemandCard } from '@/cards/DemandCard';
import { DistanceCard } from '@/cards/DistanceCard';
import { ServiceFailuresCard } from '@/cards/ServiceFailuresCard';
import { MetricGrid } from '@/components/cards/MetricGrid';
import { Clock } from '@/components/common/Clock';
import { useVideowallMetricsContext } from '@/contexts/VideowallMetrics.context';

/* * */

export function CcflDashboard() {
	//

	//
	// A. Setup variables

	const { data, flags } = useVideowallMetricsContext();
	const demandTimestamp = data.demand_metrics?.meta.generated_at ?? data.metrics?.meta.demand.generated_at;
	const demandValue = data.demand_metrics?.total.value ?? data.metrics?.total.demand;
	const serviceTimestamp = data.metrics?.meta.service.generated_at;

	//
	// F. Render components

	return (
		<MetricGrid layout="sixDetails">
			<DemandCard
				agencyLabel="CCFL"
				isLoading={flags.is_demand_loading}
				isValidating={flags.is_demand_validating}
				size="md"
				timestamp={demandTimestamp}
				trend={data.demand_metrics?.total.trend}
				value={demandValue}
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
