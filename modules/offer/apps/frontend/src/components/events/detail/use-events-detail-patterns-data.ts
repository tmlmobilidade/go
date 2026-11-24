'use client';

import { API_ROUTES } from '@tmlmobilidade/consts';
import { type EventsPatternsResponse } from '@tmlmobilidade/go-offer-pckg-types';
import { type ApiResponse, type UnixMilliseconds } from '@tmlmobilidade/go-types-shared';
import { fetchApiData } from '@tmlmobilidade/ui';
import { useMemo } from 'react';
import useSWR, { type KeyedMutator } from 'swr';

import { useEventsDetailEventId } from './use-events-detail-event-id';

/* * */

export interface UseEventsDetailPatternsDataReturnType {
	data: EventsPatternsResponse
	error: null | string
	isLoading: boolean
	isValidating: boolean
	mutate: KeyedMutator<ApiResponse<EventsPatternsResponse>>
	timestamp: null | UnixMilliseconds
}

/* * */

export function useEventsDetailPatternsData(): UseEventsDetailPatternsDataReturnType {
	//

	//
	// A. Setup variables

	const { eventId } = useEventsDetailEventId();

	//
	// B. Fetch data independently of the event record

	const { data, error, isLoading, isValidating, mutate } = useSWR<ApiResponse<EventsPatternsResponse>>(eventId ? API_ROUTES.offer.EVENTS_DETAIL_PATTERNS(eventId) : null, {
		fetcher: async (url: string) => await fetchApiData<EventsPatternsResponse>({ url }),
		refreshInterval: 60_000, // 1 minute
	});

	//
	// C. Return data

	return useMemo(() => ({
		data: data?.data ?? [],
		error: data?.error ?? error?.message ?? null,
		isLoading,
		isValidating,
		mutate,
		timestamp: data?.timestamp ?? null,
	}), [data, error, isLoading, isValidating, mutate]);
}
