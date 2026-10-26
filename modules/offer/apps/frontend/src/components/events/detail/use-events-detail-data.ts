'use client';

import { API_ROUTES } from '@tmlmobilidade/consts';
import { type EventsDetail } from '@tmlmobilidade/go-offer-pckg-types';
import { type ApiResponse, type UnixMilliseconds } from '@tmlmobilidade/go-types-shared';
import { fetchApiData } from '@tmlmobilidade/ui';
import { useMemo } from 'react';
import useSWR, { type KeyedMutator } from 'swr';

import { useEventsDetailEventId } from './use-events-detail-event-id';

/* * */

interface UseEventsDetailDataReturnType {
	data: EventsDetail | null
	error: null | string
	isLoading: boolean
	isValidating: boolean
	mutate: KeyedMutator<ApiResponse<EventsDetail>>
	timestamp: null | UnixMilliseconds
}

/* * */

export function useEventsDetailData(): UseEventsDetailDataReturnType {
	//

	//
	// A. Setup variables

	const { eventId } = useEventsDetailEventId();

	//
	// B. Fetch data

	const { data, error, isLoading, isValidating, mutate } = useSWR<ApiResponse<EventsDetail>>(eventId ? API_ROUTES.offer.EVENTS_DETAIL(eventId) : null, {
		fetcher: async (url: string) => await fetchApiData<EventsDetail>({ url }),
	});

	//
	// C. Return data

	return useMemo(() => ({
		data: data?.data ?? null,
		error: data?.error ?? error?.message ?? null,
		isLoading,
		isValidating,
		mutate,
		timestamp: data?.timestamp ?? null,
	}), [data, error, isLoading, isValidating, mutate]);
}
