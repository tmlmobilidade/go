'use client';

/* * */

import { type CmAgencyId } from '@/agencies/cm/constants';
import { DemandCard } from '@/cards-new/DemandCard';
import { AverageDelayCard } from '@/cards/AverageDelayCard';
import { DelayedServicesCard } from '@/cards/DelayedServicesCard';
import { DemandCard as DemandCardOld } from '@/cards/DemandCard';
import { DistanceCard } from '@/cards/DistanceCard';
import { ServiceFailuresCard } from '@/cards/ServiceFailuresCard';
import { MetricGrid } from '@/components/cards/MetricGrid';
import { Clock } from '@/components/common/Clock';
import { PanelGrid } from '@/components/common/PanelGrid';
import { useVideowallMetricsContext } from '@/contexts/VideowallMetrics.context';

/* * */

interface Props {
	agencyId: CmAgencyId
	agencyLabel: string
	demandDisplay?: 'cards' | 'chart'
}

/* * */

export function CmOperatorPanels({ agencyId, agencyLabel, demandDisplay = 'cards' }: Props) {
	//

	//
	// A. Setup variables

	const { data, flags } = useVideowallMetricsContext();
	const agencyMetrics = data.agency_metrics[agencyId];
	const demandTimestamp = data.demand_metrics?.meta.generated_at ?? data.metrics?.meta.demand.generated_at;
	const agencyDemand = data.demand_agency_metrics[agencyId]?.value ?? agencyMetrics?.demand;
	const totalDemand = data.demand_metrics?.total.value ?? data.metrics?.total.demand;
	const serviceTimestamp = data.metrics?.meta.service.generated_at;

	//
	// B. Render components

	return (
		<PanelGrid>
			{demandDisplay === 'chart'
				? (
					<DemandCard
						agencyLabel={agencyLabel}
						isLoading={flags.is_demand_loading}
						isValidating={flags.is_demand_validating}
						timestamp={demandTimestamp}
						trend={data.demand_agency_metrics[agencyId]?.trend}
						value={data.demand_agency_metrics[agencyId]?.value}
					/>
				)
				: (
					<MetricGrid layout="twoRows">
						<DemandCardOld
							agencyLabel={agencyLabel}
							isLoading={flags.is_demand_loading}
							isValidating={flags.is_demand_validating}
							size="lg"
							timestamp={demandTimestamp}
							trend={data.demand_agency_metrics[agencyId]?.trend}
							value={agencyDemand}
						/>
						<DemandCardOld
							agencyLabel="CM"
							isLoading={flags.is_demand_loading}
							isValidating={flags.is_demand_validating}
							size="md"
							timestamp={demandTimestamp}
							trend={data.demand_metrics?.total.trend}
							value={totalDemand}
						/>
					</MetricGrid>
				)}

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
