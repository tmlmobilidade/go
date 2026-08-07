/* * */

import { CM_AGENCIES } from '@/agencies/cm/constants';
import { type MetricBreakdownItem } from '@/components/cards/MetricBreakdown';
import { type DepartureDelayAgencyMetrics, PassengerDemandAgencyMetrics, ServiceComplianceAgencyMetrics, VkmExecutionAgencyMetrics } from '@tmlmobilidade/go-types-public-info';

/* * */

interface Params {
	demandMetrics: Record<string, PassengerDemandAgencyMetrics>
	departureDelayMetrics: Record<string, DepartureDelayAgencyMetrics>
	serviceComplianceMetrics: Record<string, ServiceComplianceAgencyMetrics>
	vkmExecutionMetrics: Record<string, VkmExecutionAgencyMetrics>
}

export interface CmMetricBreakdowns {
	demand: MetricBreakdownItem[]
	departureDelay: MetricBreakdownItem[]
	serviceCompliance: MetricBreakdownItem[]
	vkmExecution: MetricBreakdownItem[]
}

/* * */

function getSentiment(
	isAvailable: boolean,
	isAttention: boolean,
): MetricBreakdownItem['sentiment'] {
	if (!isAvailable) return 'unavailable';
	return isAttention ? 'attention' : 'healthy';
}

/* * */

function getCompactQuantity(value: null | number | undefined) {
	if (value === null || value === undefined || value < 10_000) {
		return { decimalScale: 0, suffix: undefined, value };
	}

	return {
		decimalScale: 1,
		suffix: 'k',
		value: value / 1_000,
	};
}

/* * */

export function getCmMetricBreakdowns({
	demandMetrics,
	departureDelayMetrics,
	serviceComplianceMetrics,
	vkmExecutionMetrics,
}: Params): CmMetricBreakdowns {
	const demand = CM_AGENCIES.map((agency): MetricBreakdownItem => {
		const value = demandMetrics[agency.agency_id]?.value;
		const compactQuantity = getCompactQuantity(value?.passenger_validations_qty_now);
		const typicalComparisonIndex = value?.typical_comparison_index_pct;
		const deviationPercentage = typicalComparisonIndex === null || typicalComparisonIndex === undefined
			? null
			: typicalComparisonIndex - 100;

		return {
			label: agency.short_name,
			primaryDecimalScale: compactQuantity.decimalScale,
			primarySuffix: compactQuantity.suffix,
			primaryValue: compactQuantity.value,
			secondaryDecimalScale: 1,
			secondaryPrefix: deviationPercentage !== null && deviationPercentage > 0 ? '+' : undefined,
			secondarySuffix: '%',
			secondaryValue: deviationPercentage,
			sentiment: getSentiment(Boolean(value), value?.deviation_status === 'below_typical'),
		};
	});
	const serviceCompliance = CM_AGENCIES.map((agency): MetricBreakdownItem => {
		const value = serviceComplianceMetrics[agency.agency_id]?.value;
		const compliancePercentage = value?.compliance_pct;
		const unexecutedPercentage = compliancePercentage === null || compliancePercentage === undefined
			? null
			: 100 - compliancePercentage;

		return {
			label: agency.short_name,
			primaryValue: value?.unexecuted_rides_qty,
			secondaryDecimalScale: 1,
			secondarySuffix: '%',
			secondaryValue: unexecutedPercentage,
			sentiment: getSentiment(Boolean(value), value?.compliance_status === 'below_target'),
		};
	});
	const departureDelay = CM_AGENCIES.map((agency): MetricBreakdownItem => {
		const value = departureDelayMetrics[agency.agency_id]?.value;

		return {
			label: agency.short_name,
			primaryValue: value?.delayed_more_than_five_minutes_rides_qty,
			secondaryDecimalScale: 1,
			secondarySuffix: '%',
			secondaryValue: value?.delayed_more_than_five_minutes_pct,
			sentiment: getSentiment(Boolean(value), value?.delay_status === 'above_target'),
		};
	});
	const vkmExecution = CM_AGENCIES.map((agency): MetricBreakdownItem => {
		const value = vkmExecutionMetrics[agency.agency_id]?.value;
		const compactQuantity = getCompactQuantity(value?.executed_distance_km);

		return {
			label: agency.short_name,
			primaryDecimalScale: compactQuantity.decimalScale,
			primarySuffix: compactQuantity.suffix,
			primaryValue: compactQuantity.value,
			secondaryDecimalScale: 1,
			secondarySuffix: '%',
			secondaryValue: value?.execution_pct,
			sentiment: getSentiment(Boolean(value), value?.execution_status === 'below_target'),
		};
	});

	return { demand, departureDelay, serviceCompliance, vkmExecution };
}
