'use client';

/* * */

import { API_ROUTES } from '@tmlmobilidade/consts';
import { type PlannedSupplyBreakdown, type PlannedSupplyDayProfiles, type PlannedSupplyMetrics, type PlannedSupplySeries, type PlannedSupplyTimeProfile } from '@tmlmobilidade/go-types-performance';
import useSWR from 'swr';

import { createPlannedSupplyQuery, type PlannedSupplyQueryFilters } from './query';

/* * */

export function usePlannedSupplySummary(filters: PlannedSupplyQueryFilters, enabled = true) {
	const query = createPlannedSupplyQuery(filters);
	return useSWR<PlannedSupplyMetrics, Error>(enabled ? `${API_ROUTES.performance.PLANNED_SUPPLY_SUMMARY}?${query.toString()}` : null);
}

export function usePlannedSupplySeries(filters: PlannedSupplyQueryFilters, enabled = true) {
	const query = createPlannedSupplyQuery(filters);
	return useSWR<PlannedSupplySeries, Error>(enabled ? `${API_ROUTES.performance.PLANNED_SUPPLY_SERIES}?${query.toString()}` : null);
}

export function usePlannedSupplyBreakdown(filters: PlannedSupplyQueryFilters, enabled = true) {
	const query = createPlannedSupplyQuery(filters);
	query.set('dimension', 'pattern');
	return useSWR<PlannedSupplyBreakdown, Error>(enabled ? `${API_ROUTES.performance.PLANNED_SUPPLY_BREAKDOWN}?${query.toString()}` : null);
}

export function usePlannedSupplyTimeProfile(filters: PlannedSupplyQueryFilters, enabled = true) {
	const query = createPlannedSupplyQuery(filters);
	return useSWR<PlannedSupplyTimeProfile, Error>(enabled ? `${API_ROUTES.performance.PLANNED_SUPPLY_TIME_PROFILE}?${query.toString()}` : null);
}

export function usePlannedSupplyDayProfiles(filters: PlannedSupplyQueryFilters, enabled = true) {
	const query = createPlannedSupplyQuery(filters);
	return useSWR<PlannedSupplyDayProfiles, Error>(enabled ? `${API_ROUTES.performance.PLANNED_SUPPLY_DAY_PROFILES}?${query.toString()}` : null);
}

/* * */
