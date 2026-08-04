'use client';

/* * */

import { type CmAgencyId } from '@/agencies/cm/constants';
import { DelayCard } from '@/cards-new/DelayCard';
import { DemandCard } from '@/cards-new/DemandCard';
import { ServiceComplianceCard } from '@/cards-new/ServiceComplianceCard';
import { VkmExecutionCard } from '@/cards-new/VkmExecutionCard';
import { MetricGrid } from '@/components/cards/MetricGrid';
import { PanelGrid } from '@/components/common/PanelGrid';
import { useVideowallMetricsContext } from '@/contexts/VideowallMetrics.context';

/* * */

interface Props {
	agencyId: CmAgencyId
}

/* * */

export function CmOperatorPanels({ agencyId }: Props) {
	//

	//
	// A. Setup variables

	const { data, flags } = useVideowallMetricsContext();
	const demandTimestamp = data.demand_metrics?.meta.generated_at ?? data.metrics?.meta.demand.generated_at;
	const departureDelayMetrics = data.departure_delay_metrics;
	const departureDelayAgencyMetrics = data.departure_delay_agency_metrics[agencyId];
	const serviceComplianceMetrics = data.service_compliance_metrics;
	const serviceComplianceAgencyMetrics = data.service_compliance_agency_metrics[agencyId];
	const vkmExecutionMetrics = data.vkm_execution_metrics;
	const vkmExecutionAgencyMetrics = data.vkm_execution_agency_metrics[agencyId];

	//
	// B. Render components

	return (
		<PanelGrid fillContainer>
			<MetricGrid layout="single">
				<DemandCard
					isLoading={flags.is_demand_loading}
					isValidating={flags.is_demand_validating}
					timestamp={demandTimestamp}
					trend={data.demand_agency_metrics[agencyId]?.trend}
					value={data.demand_agency_metrics[agencyId]?.value}
				/>
			</MetricGrid>

			<MetricGrid layout="single">
				<ServiceComplianceCard
					isLoading={flags.is_service_compliance_loading}
					isValidating={flags.is_service_compliance_validating}
					targetPercentage={serviceComplianceMetrics?.meta.target_pct ?? 95}
					timestamp={serviceComplianceMetrics?.meta.generated_at}
					trend={serviceComplianceAgencyMetrics?.trend}
					value={serviceComplianceAgencyMetrics?.value}
				/>
			</MetricGrid>

			<MetricGrid layout="single">
				<DelayCard
					isLoading={flags.is_departure_delay_loading}
					isValidating={flags.is_departure_delay_validating}
					targetPercentage={departureDelayMetrics?.meta.target_pct ?? 10}
					timestamp={departureDelayMetrics?.meta.generated_at}
					trend={departureDelayAgencyMetrics?.trend}
					value={departureDelayAgencyMetrics?.value}
				/>
			</MetricGrid>

			<MetricGrid layout="single">
				<VkmExecutionCard
					isLoading={flags.is_vkm_execution_loading}
					isValidating={flags.is_vkm_execution_validating}
					targetPercentage={vkmExecutionMetrics?.meta.target_pct ?? 95}
					timestamp={vkmExecutionMetrics?.meta.generated_at}
					trend={vkmExecutionAgencyMetrics?.trend}
					value={vkmExecutionAgencyMetrics?.value}
				/>
			</MetricGrid>
		</PanelGrid>
	);

	//
}
