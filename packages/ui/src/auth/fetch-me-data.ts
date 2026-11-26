'use client';

import { type MeUser } from '@tmlmobilidade/go-types-core';
import { type ApiResponse } from '@tmlmobilidade/go-types-shared';
import { Dates } from '@tmlmobilidade/go-utils-dates';

/* * */

function unauthenticatedResponse<T>(error: string): ApiResponse<T> {
	return { data: null, error, status_code: '401', timestamp: Dates.now('utc').unix_milliseconds };
}

/** Keep transport failures as SWR errors; only a confirmed 401 clears the authenticated user. */
export async function fetchMeData<T = MeUser>(url: string): Promise<ApiResponse<T>> {
	const response = await fetch(url, { cache: 'no-store', credentials: 'include' });
	if (response.status === 401) return unauthenticatedResponse('Session is no longer authenticated');
	const result = await response.json() as ApiResponse<T> & { statusCode?: number };
	// Authentication middleware still uses statusCode in some responses, including HTTP 200 responses.
	if (result.status_code === '401' || result.statusCode === 401) return unauthenticatedResponse(result.error ?? 'Session is no longer authenticated');
	if (!response.ok || result.error || !result.data) throw new Error(result.error ?? `Unable to load current user (${response.status})`);
	return result;
}
