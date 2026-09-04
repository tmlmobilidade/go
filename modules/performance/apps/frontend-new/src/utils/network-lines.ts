/* * */

import { type NetworkLine } from '@/types/network-line';
import { type PassengerDemandBreakdownItem, type PerformanceNetworkAgency, type PerformanceNetworkLine, type RidePerformanceByLineItem } from '@tmlmobilidade/go-types-performance';

/* * */

interface ComposeNetworkLinesOptions {
	comparisonDemand?: PassengerDemandBreakdownItem[]
	demand?: PassengerDemandBreakdownItem[]
	lines: PerformanceNetworkLine[]
	ridePerformance?: RidePerformanceByLineItem[]
	selectedAgencies: PerformanceNetworkAgency[]
}

/* * */

export function composeNetworkLines({
	comparisonDemand,
	demand,
	lines,
	ridePerformance,
	selectedAgencies,
}: ComposeNetworkLinesOptions): NetworkLine[] {
	const operatorNameById = new Map(selectedAgencies.flatMap(agency => (
		[agency._id, agency.code, ...agency.metric_ids].map(id => [id, agency.short_name] as const)
	)));
	const canonicalAgencyIdByAlias = new Map(selectedAgencies.flatMap(agency => (
		[agency._id, agency.code, ...agency.metric_ids].map(id => [id, agency._id] as const)
	)));
	const getLineKey = (agencyId: string, lineId: string) => `${canonicalAgencyIdByAlias.get(agencyId) ?? agencyId}:${lineId}`;
	const demandByLine = new Map(demand?.flatMap(item => item.agency_id ? [[getLineKey(item.agency_id, item.id), item.passenger_demand] as const] : []));
	const comparisonDemandByLine = new Map(comparisonDemand?.flatMap(item => item.agency_id ? [[getLineKey(item.agency_id, item.id), item.passenger_demand] as const] : []));
	const ridePerformanceByLine = new Map(ridePerformance?.map(item => [getLineKey(item.agency_id, item.line_id), item]));

	return lines.map((line) => {
		const canonicalAgencyId = canonicalAgencyIdByAlias.get(line.agency_id) ?? line.agency_id;
		const validations = demandByLine.get(`${canonicalAgencyId}:${line.code}`) ?? demandByLine.get(`${canonicalAgencyId}:${line._id}`) ?? null;
		const comparisonValidations = comparisonDemandByLine.get(`${canonicalAgencyId}:${line.code}`) ?? comparisonDemandByLine.get(`${canonicalAgencyId}:${line._id}`) ?? null;
		const performance = ridePerformanceByLine.get(`${canonicalAgencyId}:${line.code}`) ?? ridePerformanceByLine.get(`${canonicalAgencyId}:${line._id}`);
		const service = performance?.current.service_pct ?? null;
		const delays = performance?.current.delays_pct ?? null;

		return {
			_id: line._id,
			advances: performance?.current.advances_pct ?? null,
			coverage: performance?.current.coverage_pct ?? null,
			delayDelta: performance?.delays_delta_pp ?? null,
			delays,
			id: line.code,
			name: line.name,
			needsAttention: (service !== null && service < 95) || (delays !== null && delays > 10),
			operator: operatorNameById.get(line.agency_id) ?? line.agency_id,
			service,
			serviceDelta: performance?.service_delta_pp ?? null,
			validations,
			validationsDelta: validations === null || !comparisonValidations
				? null
				: (validations - comparisonValidations) / comparisonValidations * 100,
		};
	});
}
