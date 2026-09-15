'use client';

import { API_ROUTES } from '@tmlmobilidade/consts';
import { type Event } from '@tmlmobilidade/go-types-offer';
import { type ApiResponse, type UnixMilliseconds } from '@tmlmobilidade/go-types-shared';
import { fetchApiData } from '@tmlmobilidade/ui';
import { useMemo } from 'react';
import useSWR from 'swr';

import { useEventsDetailEventId } from './use-events-detail-event-id';

/* * */

interface UseEventsDetailDataReturnType {
	data: Event | null
	error: null | string
	isLoading: boolean
	isValidating: boolean
	mutate: (newData?: ApiResponse<Event>) => void
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

	const { data, error, isLoading, isValidating, mutate } = useSWR<ApiResponse<Event>>(API_ROUTES.dates.EVENTS_DETAIL(eventId), {
		fetcher: async (url: string) => await fetchApiData<Event>({ url }),
	});

	//
	// C. Return data

	return useMemo(() => ({
		data: data?.data ?? null,
		error: data?.error ?? error?.error ?? null,
		isLoading,
		isValidating,
		mutate,
		timestamp: data?.timestamp ?? null,
	}), [data?.data, data?.error, data?.timestamp, error, isLoading, isValidating, mutate]);
};
