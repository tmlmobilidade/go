'use client';

/* * */

import { useAgenciesContext } from '@/contexts/Agencies.context';
import { usePerformanceFiltersContext } from '@/contexts/PerformanceFilters.context';
import { NETWORK_LINES } from '@/data/network-lines';
import { type NetworkLine } from '@/types/network-line';
import { API_ROUTES } from '@tmlmobilidade/consts';
import { type PassengerDemandByLineItem, type PerformanceNetworkLine } from '@tmlmobilidade/go-types-performance';
import { useMemo } from 'react';
import useSWR from 'swr';

/* * */

function formatOperationalDate(date: Date) {
	return new Intl.DateTimeFormat('sv-SE', {
		day: '2-digit',
		month: '2-digit',
		timeZone: 'Europe/Lisbon',
		year: 'numeric',
	}).format(date);
}

function getOperationalDateRange(dateFilter: string) {
	const endDate = new Date();
	if (dateFilter === 'yesterday') endDate.setDate(endDate.getDate() - 1);

	const startDate = new Date(endDate);
	startDate.setDate(1);

	return {
		endDate: formatOperationalDate(endDate),
		startDate: formatOperationalDate(startDate),
	};
}

/* * */

export function useNetworkLinesData() {
	//

	// A. Setup variables

	const agenciesContext = useAgenciesContext();
	const filtersContext = usePerformanceFiltersContext();
	const operationalDateRange = getOperationalDateRange(filtersContext.filters.date.value);
	const selectedAgencies = useMemo(() => {
		const selectedIds = new Set(filtersContext.filters.operator.values);
		return agenciesContext.data.agencies.filter(agency => selectedIds.has(agency._id));
	}, [agenciesContext.data.agencies, filtersContext.filters.operator.values]);
	const selectedMetricAgencyIds = useMemo(
		() => selectedAgencies.flatMap(agency => agency.metric_ids),
		[selectedAgencies],
	);
	const demandQuery = new URLSearchParams({
		end_date: operationalDateRange.endDate,
		exclude_unknown: 'true',
		limit: '1000',
		start_date: operationalDateRange.startDate,
	});
	selectedMetricAgencyIds.forEach(agencyId => demandQuery.append('agency_ids', agencyId));
	const networkQuery = new URLSearchParams({
		end_date: operationalDateRange.endDate,
		start_date: operationalDateRange.startDate,
	});
	selectedMetricAgencyIds.forEach(agencyId => networkQuery.append('agency_ids', agencyId));

	//
	// B. Fetch data

	const linesRequest = useSWR<PerformanceNetworkLine[], Error>(
		agenciesContext.flags.is_loading ? null : `${API_ROUTES.performance.NETWORK_LINES}?${networkQuery.toString()}`,
	);
	const demandRequest = useSWR<PassengerDemandByLineItem[], Error>(
		agenciesContext.flags.is_loading ? null : `${API_ROUTES.performance.PASSENGER_DEMAND_BY_LINE}?${demandQuery.toString()}`,
	);

	//
	// C. Transform data

	const lines = useMemo<NetworkLine[]>(() => {
		if (!linesRequest.data) return [];

		const operatorNameById = new Map(selectedAgencies.flatMap(agency => (
			[agency._id, agency.code, ...agency.metric_ids].map(id => [id, agency.short_name] as const)
		)));
		const canonicalAgencyIdByAlias = new Map(selectedAgencies.flatMap(agency => (
			[agency._id, agency.code, ...agency.metric_ids].map(id => [id, agency._id] as const)
		)));
		const demandByLine = new Map(demandRequest.data?.map(item => [
			`${canonicalAgencyIdByAlias.get(item.agency_id) ?? item.agency_id}:${item.line_id}`,
			item.passenger_demand,
		]));

		return linesRequest.data.map((line, index) => {
			const simulated = NETWORK_LINES[index % NETWORK_LINES.length];
			const canonicalAgencyId = canonicalAgencyIdByAlias.get(line.agency_id) ?? line.agency_id;
			const validationsByCode = demandByLine.get(`${canonicalAgencyId}:${line.code}`);
			const validationsById = demandByLine.get(`${canonicalAgencyId}:${line._id}`);
			const validations = validationsByCode ?? validationsById ?? null;

			return {
				...simulated,
				_id: line._id,
				id: line.code,
				name: line.name,
				operator: operatorNameById.get(line.agency_id) ?? line.agency_id,
				validations,
				validationsDelta: null,
			};
		});
	}, [demandRequest.data, linesRequest.data, selectedAgencies]);

	//
	// D. Return data

	return {
		data: lines,
		flags: {
			has_real_demand: !!demandRequest.data?.length,
			has_real_lines: !!linesRequest.data,
			is_loading: agenciesContext.flags.is_loading || linesRequest.isLoading || demandRequest.isLoading,
		},
	};

	//
}
