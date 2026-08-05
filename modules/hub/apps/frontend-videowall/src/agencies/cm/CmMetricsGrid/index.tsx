'use client';

/* * */

import { type CmAgencyId } from '@/agencies/cm/constants';
import { AGENCY_ROUTE_CONFIG } from '@/agencies/config';
import { DelayCard } from '@/cards/DelayCard';
import { DemandCard } from '@/cards/DemandCard';
import { ServiceComplianceCard } from '@/cards/ServiceComplianceCard';
import { VkmExecutionCard } from '@/cards/VkmExecutionCard';
import { PanelGrid } from '@/components/common/PanelGrid';
import { useVideowallMetricsContext } from '@/contexts/VideowallMetrics.context';
import { getCmMetricBreakdowns } from '@/utils/cm-metric-breakdowns';

/* * */

type Props =
  | { agencyId: CmAgencyId, scope: 'agency' }
  | { scope: 'aggregate' };

/* * */

export function CmMetricsGrid(props: Props) {
	//

	//
	// A. Setup variables

	const { data, flags } = useVideowallMetricsContext();
	const isAggregate = props.scope === 'aggregate';
	const agencyId = props.scope === 'agency' ? props.agencyId : undefined;
	const agencyLabel = isAggregate ? AGENCY_ROUTE_CONFIG.cm.label : undefined;
	const demandMetrics = agencyId
		? data.demand_agency_metrics[agencyId]
		: data.demand_metrics?.total;
	const departureDelayMetrics = agencyId
		? data.departure_delay_agency_metrics[agencyId]
		: data.departure_delay_metrics?.total;
	const serviceComplianceMetrics = agencyId
		? data.service_compliance_agency_metrics[agencyId]
		: data.service_compliance_metrics?.total;
	const vkmExecutionMetrics = agencyId
		? data.vkm_execution_agency_metrics[agencyId]
		: data.vkm_execution_metrics?.total;
	const breakdowns = isAggregate
		? getCmMetricBreakdowns({
			demandMetrics: data.demand_agency_metrics,
			departureDelayMetrics: data.departure_delay_agency_metrics,
			serviceComplianceMetrics: data.service_compliance_agency_metrics,
			vkmExecutionMetrics: data.vkm_execution_agency_metrics,
		})
		: undefined;

	//
	// F. Render components

	return (
		<PanelGrid fillContainer>
			<DemandCard
				agencyLabel={agencyLabel}
				breakdown={breakdowns?.demand}
				isLoading={flags.is_demand_loading}
				isValidating={flags.is_demand_validating}
				timestamp={data.demand_metrics?.meta.generated_at}
				trend={demandMetrics?.trend}
				value={demandMetrics?.value}
			/>

			<ServiceComplianceCard
				agencyLabel={agencyLabel}
				breakdown={breakdowns?.serviceCompliance}
				isLoading={flags.is_service_compliance_loading}
				isValidating={flags.is_service_compliance_validating}
				targetPercentage={data.service_compliance_metrics?.meta.target_pct ?? 95}
				timestamp={data.service_compliance_metrics?.meta.generated_at}
				trend={serviceComplianceMetrics?.trend}
				value={serviceComplianceMetrics?.value}
			/>

			<DelayCard
				agencyLabel={agencyLabel}
				breakdown={breakdowns?.departureDelay}
				isLoading={flags.is_departure_delay_loading}
				isValidating={flags.is_departure_delay_validating}
				targetPercentage={data.departure_delay_metrics?.meta.target_pct ?? 10}
				timestamp={data.departure_delay_metrics?.meta.generated_at}
				trend={departureDelayMetrics?.trend}
				value={departureDelayMetrics?.value}
			/>

			<VkmExecutionCard
				agencyLabel={agencyLabel}
				breakdown={breakdowns?.vkmExecution}
				isLoading={flags.is_vkm_execution_loading}
				isValidating={flags.is_vkm_execution_validating}
				targetPercentage={data.vkm_execution_metrics?.meta.target_pct ?? 95}
				timestamp={data.vkm_execution_metrics?.meta.generated_at}
				trend={vkmExecutionMetrics?.trend}
				value={vkmExecutionMetrics?.value}
			/>
		</PanelGrid>
	);

	//
}
