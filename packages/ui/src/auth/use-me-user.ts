'use client';

import { API_ROUTES } from '@tmlmobilidade/consts';
import { type MeUser } from '@tmlmobilidade/go-types-core';
import { type ApiResponse, type UnixMilliseconds } from '@tmlmobilidade/go-types-shared';
import { useMemo } from 'react';
import useSWR from 'swr';

import { fetchMeData } from './fetch-me-data';

/* * */

interface UseMeUserReturnType {
	data: MeUser | undefined
	error: null | string
	/** Undefined means authentication has not been established; false means a confirmed 401. */
	isAuthenticated: boolean | undefined
	isLoading: boolean
	isValidating: boolean
	mutate: (data?: ApiResponse<MeUser>) => void
	timestamp: null | UnixMilliseconds
}

/* * */

export function useMeUser(enabled = true, refreshInterval = 60_000): UseMeUserReturnType {
	const { data, error, isLoading, isValidating, mutate } = useSWR<ApiResponse<MeUser>, Error>(enabled ? API_ROUTES.core.ME_LIST_ME_USER : null, {
		fetcher: fetchMeData,
		refreshInterval,
	});

	return useMemo(() => ({
		data: data?.data ?? undefined,
		error: data?.error ?? error?.message ?? null,
		isAuthenticated: data?.status_code === '401' ? false : data?.data ? true : undefined,
		isLoading,
		isValidating,
		mutate,
		timestamp: data?.timestamp,
	}), [data, error, isLoading, isValidating, mutate]);
};
