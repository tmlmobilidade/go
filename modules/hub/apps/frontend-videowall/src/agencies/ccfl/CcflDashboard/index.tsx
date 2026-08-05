'use client';

/* * */

import { DelayCard } from '@/cards/DelayCard';
import { DemandCard } from '@/cards/DemandCard';
import { ServiceComplianceCard } from '@/cards/ServiceComplianceCard';
import { VkmExecutionCard } from '@/cards/VkmExecutionCard';
import { PanelGrid } from '@/components/common/PanelGrid';
import { useVideowallMetricsContext } from '@/contexts/VideowallMetrics.context';

/* * */

export function CcflDashboard() {
	//

	//
	// A. Setup variables

	const { data, flags } = useVideowallMetricsContext();
	const demandMetrics = data.demand_metrics;
	const departureDelayMetrics = data.departure_delay_metrics;
	const serviceComplianceMetrics = data.service_compliance_metrics;
	const vkmExecutionMetrics = data.vkm_execution_metrics;

	//
	// F. Render components

	return (
		<PanelGrid fillContainer>
			<DemandCard
				agencyLabel="CCFL"
				isLoading={flags.is_demand_loading}
				isValidating={flags.is_demand_validating}
				timestamp={demandMetrics?.meta.generated_at}
				trend={demandMetrics?.total.trend}
				value={demandMetrics?.total.value}
			/>
			<ServiceComplianceCard
				agencyLabel="CCFL"
				isLoading={flags.is_service_compliance_loading}
				isValidating={flags.is_service_compliance_validating}
				targetPercentage={serviceComplianceMetrics?.meta.target_pct ?? 95}
				timestamp={serviceComplianceMetrics?.meta.generated_at}
				trend={serviceComplianceMetrics?.total.trend}
				value={serviceComplianceMetrics?.total.value}
			/>
			<DelayCard
				agencyLabel="CCFL"
				isLoading={flags.is_departure_delay_loading}
				isValidating={flags.is_departure_delay_validating}
				targetPercentage={departureDelayMetrics?.meta.target_pct ?? 10}
				timestamp={departureDelayMetrics?.meta.generated_at}
				trend={departureDelayMetrics?.total.trend}
				value={departureDelayMetrics?.total.value}
			/>
			<VkmExecutionCard
				agencyLabel="CCFL"
				isLoading={flags.is_vkm_execution_loading}
				isValidating={flags.is_vkm_execution_validating}
				targetPercentage={vkmExecutionMetrics?.meta.target_pct ?? 95}
				timestamp={vkmExecutionMetrics?.meta.generated_at}
				trend={vkmExecutionMetrics?.total.trend}
				value={vkmExecutionMetrics?.total.value}
			/>
		</PanelGrid>
	);

	//
}
