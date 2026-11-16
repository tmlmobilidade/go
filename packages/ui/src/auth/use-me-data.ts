'use client';

import { API_ROUTES } from '@tmlmobilidade/consts';
import { type User } from '@tmlmobilidade/go-types-core';
import { type ApiResponse, type UnixMilliseconds } from '@tmlmobilidade/go-types-shared';
import { type AnalyticsReplayAuthorization } from '@tmlmobilidade/go-ui-analytics';
import { useMemo } from 'react';
import useSWR from 'swr';

import { fetchMeData, type MeDataResponse } from './fetch-me-data';

/* * */

interface UseMeDataReturnType {
	data: User
	error: null | string
	/** Undefined means authentication has not been established; false means a confirmed 401. */
	isAuthenticated: boolean | undefined
	isLoading: boolean
	isValidating: boolean
	mutate: (data?: ApiResponse<User>) => void
	replayAuthorization: AnalyticsReplayAuthorization | undefined
	timestamp: null | UnixMilliseconds
}

/* * */

export function useMeData(enabled = true, refreshInterval = 60_000): UseMeDataReturnType {
	//

	//
	// Fetch data

	const { data, error, isLoading, isValidating, mutate } = useSWR<MeDataResponse, Error>(enabled ? API_ROUTES.core.ME_LIST : null, {
		fetcher: fetchMeData,
		refreshInterval,
	});

	//
	// Return data

	return useMemo(() => ({
		data: data?.data,
		error: data?.error ?? error?.message ?? null,
		isAuthenticated: data?.status_code === '401' ? false : data?.data ? true : undefined,
		isLoading,
		isValidating,
		mutate,
		// A failed refresh stops capture while SWR preserves the last known user.
		replayAuthorization: error ? undefined : data?.replayAuthorization,
		timestamp: data?.timestamp,
	}), [data, error, isLoading, isValidating, mutate]);
};
