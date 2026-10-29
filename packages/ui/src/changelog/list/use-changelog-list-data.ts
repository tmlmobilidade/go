'use client';

import { API_ROUTES } from '@tmlmobilidade/consts';
import { type ChangelogSummary, type MarkChangelogSeenDto, type MarkChangelogSeenResult } from '@tmlmobilidade/go-types-core';
import { type ApiResponse } from '@tmlmobilidade/go-types-shared';
import { Dates } from '@tmlmobilidade/go-utils-dates';
import { useCallback, useMemo, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import useSWR from 'swr';

import { fetchApiData } from '../../fetch/fetch-api-data';
import { useHandleAction } from '../../fetch/use-handle-action';

/* * */

interface UseChangelogListDataReturnType {
	data: ChangelogSummary[]
	error: Error | undefined
	isLoading: boolean
	isMarkingRead: boolean
	markAllRead: () => void
	markSeen: (releaseId: string) => void
	retry: () => void
	unreadCount: number
}

/* * */

// Reject API errors so SWR can expose them and retry the request.
export async function getAllChangelogSummaries(): Promise<ChangelogSummary[]> {
	const response = await fetchApiData<ChangelogSummary[]>({ url: API_ROUTES.core.CHANGELOG_LIST });
	if (response.error || !response.data) throw new Error(response.error || 'Empty changelog response');
	return response.data;
}

/* * */

export async function markChangelogsRead(releaseIds: string[]): Promise<ApiResponse<MarkChangelogSeenResult>> {
	// The acknowledgement endpoint accepts at most 100 release IDs per request.
	for (let index = 0; index < releaseIds.length; index += 100) {
		const response = await fetchApiData<MarkChangelogSeenResult, MarkChangelogSeenDto>({
			body: { release_ids: releaseIds.slice(index, index + 100) },
			method: 'POST',
			url: API_ROUTES.core.CHANGELOG_SEEN,
		});
		if (response.error) return response;
		if (!response.data?.success) return { data: null, error: 'Could not mark changelog releases as read', status_code: '500', timestamp: response.timestamp };
	}
	return { data: { success: true }, error: null, generated_at: null, status_code: '200', timestamp: Dates.now('utc').unix_milliseconds };
}

/* * */

export function useChangelogListData(): UseChangelogListDataReturnType {
	//
	// A. Setup variables

	const { t } = useTranslation();
	const pendingReadIds = useRef(new Set<string>());

	//
	// B. Fetch data

	const { data, error, isLoading, mutate } = useSWR<ChangelogSummary[], Error>(
		[API_ROUTES.core.CHANGELOG_LIST, 'all-summaries'],
		getAllChangelogSummaries,
		{ refreshInterval: 600_000, revalidateOnFocus: false },
	);

	//
	// C. Handle actions

	const markRead = useHandleAction<MarkChangelogSeenResult, string[]>({
		fetchFn: markChangelogsRead,
		labels: {
			error_title: t('shared:components.changelog.mark_read_error'),
			success_title: t('shared:components.changelog.mark_read_success'),
		},
		onError: () => { void mutate(); },
		onSuccess: () => { void mutate(current => current?.map(release => pendingReadIds.current.has(release._id) ? { ...release, is_seen: true } : release), { revalidate: false }); },
	});

	const handleMarkAllRead = useCallback(() => {
		if (markRead.isLoading || isLoading) return;
		const ids = (data ?? []).filter(release => !release.is_seen).map(release => release._id);
		if (!ids.length) return;
		pendingReadIds.current = new Set(ids);
		void markRead.action(ids);
	}, [data, isLoading, markRead.action, markRead.isLoading]);

	const handleMarkSeen = useCallback((releaseId: string) => {
		if (data?.find(release => release._id === releaseId)?.is_seen !== false) return;
		void mutate(current => current?.map(release => release._id === releaseId ? { ...release, is_seen: true } : release), { revalidate: false });
		void markChangelogsRead([releaseId]).then((response) => {
			if (response.error) void mutate();
		});
	}, [data, mutate]);

	//
	// D. Return data

	return useMemo(() => ({
		data: data ?? [],
		error,
		isLoading,
		isMarkingRead: markRead.isLoading,
		markAllRead: handleMarkAllRead,
		markSeen: handleMarkSeen,
		retry: () => { void mutate(); },
		unreadCount: (data ?? []).filter(release => !release.is_seen).length,
	}), [data, error, isLoading, markRead.isLoading, mutate, handleMarkAllRead, handleMarkSeen]);
}
