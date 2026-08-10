'use client';

import { type DelayStatus, type OperationalStatus, type TicketingStatus, type UnixTimestamp } from '@tmlmobilidade/go-types-shared';
import { createStore } from '@tmlmobilidade/ui';

/**
 * The state of the rides filters.
 */
interface RidesFiltersState {
	agency_ids: string[]
	delay_statuses: DelayStatus[]
	operational_statuses: OperationalStatus[]
	scheduled_start_time_end: null | UnixTimestamp
	scheduled_start_time_start: null | UnixTimestamp
	search: string
	ticketing_statuses: TicketingStatus[]
}

const ridesFiltersStore = createStore<RidesFiltersState>({
	agency_ids: [],
	delay_statuses: [],
	operational_statuses: [],
	scheduled_start_time_end: null,
	scheduled_start_time_start: null,
	search: '',
	ticketing_statuses: [],
});

export function useRidesFilters() {
	return ridesFiltersStore.useStore();
}
