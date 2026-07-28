'use client';

/* * */

import { type CmAgencyId } from '@/agencies/cm/constants';
import { AverageDelayCard } from '@/cards/AverageDelayCard';
import { DelayedServicesCard } from '@/cards/DelayedServicesCard';
import { DemandCard } from '@/cards/DemandCard';
import { DistanceCard } from '@/cards/DistanceCard';
import { ServiceFailuresCard } from '@/cards/ServiceFailuresCard';
import { Clock } from '@/components/Clock';
import { MetricGrid } from '@/components/MetricGrid';
import { PanelGrid } from '@/components/PanelGrid';
import { useVideowallMetricsContext } from '@/contexts/VideowallMetrics.context';

/* * */

interface Props {
	agencyId: CmAgencyId
	agencyLabel: string
}

/* * */

export function CmOperatorPanels({ agencyId, agencyLabel }: Props) {
	//

	//
	// A. Setup variables

	const { data, flags } = useVideowallMetricsContext();
	const agencyMetrics = data.agency_metrics[agencyId];
	const demandTimestamp = data.metrics?.meta.demand.generated_at;
	const serviceTimestamp = data.metrics?.meta.service.generated_at;

	//
	// B. Render components

	return (
		<PanelGrid>
			<MetricGrid layout="twoRows">
				<DemandCard
					agencyLabel={agencyLabel}
					isLoading={flags.is_loading}
					isValidating={flags.is_validating}
					size="lg"
					timestamp={demandTimestamp}
					value={agencyMetrics?.demand}
				/>
				<DemandCard
					agencyLabel="CM"
					isLoading={flags.is_loading}
					isValidating={flags.is_validating}
					size="md"
					timestamp={demandTimestamp}
					value={data.metrics?.total.demand}
				/>
			</MetricGrid>

			<MetricGrid layout="twoRows">
				<ServiceFailuresCard
					agencyLabel={agencyLabel}
					isLoading={flags.is_loading}
					isValidating={flags.is_validating}
					size="lg"
					timestamp={serviceTimestamp}
					value={agencyMetrics?.service}
				/>
				<ServiceFailuresCard
					agencyLabel="CM"
					isLoading={flags.is_loading}
					isValidating={flags.is_validating}
					size="md"
					timestamp={serviceTimestamp}
					value={data.metrics?.total.service}
				/>
			</MetricGrid>

			<MetricGrid layout="primaryWithTwoDetails">
				<DelayedServicesCard
					agencyLabel={agencyLabel}
					isLoading={flags.is_loading}
					isValidating={flags.is_validating}
					size="lg"
					timestamp={serviceTimestamp}
					value={agencyMetrics?.service}
				/>
				<AverageDelayCard
					agencyLabel="CM"
					isLoading={flags.is_loading}
					isValidating={flags.is_validating}
					size="md"
					timestamp={serviceTimestamp}
					value={data.metrics?.total.service}
				/>
				<DelayedServicesCard
					agencyLabel="CM"
					isLoading={flags.is_loading}
					isValidating={flags.is_validating}
					size="md"
					timestamp={serviceTimestamp}
					value={data.metrics?.total.service}
				/>
			</MetricGrid>

			<MetricGrid layout="primaryWithTwoDetails">
				<DistanceCard
					agencyLabel={agencyLabel}
					isLoading={flags.is_loading}
					isValidating={flags.is_validating}
					size="lg"
					timestamp={serviceTimestamp}
					value={agencyMetrics?.service}
				/>
				<DistanceCard
					agencyLabel="CM"
					isLoading={flags.is_loading}
					isValidating={flags.is_validating}
					size="md"
					timestamp={serviceTimestamp}
					value={data.metrics?.total.service}
				/>
				<Clock size="md" />
			</MetricGrid>
		</PanelGrid>
	);

	//
}
