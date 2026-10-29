'use client';

import { API_ROUTES } from '@tmlmobilidade/consts';
import { type BannerReader, type ContentModuleId, ContentModuleIdSchema } from '@tmlmobilidade/go-types-core';
import { type ApiResponse } from '@tmlmobilidade/go-types-shared';
import { useCallback, useMemo } from 'react';
import useSWR from 'swr';

import { fetchApiData } from '../../../fetch/fetch-api-data';

/* * */

interface UseActiveBannersDataReturnType {
	data: BannerReader[]
	dismiss: (banner: BannerReader) => Promise<void>
}

/* * */

/** Each module frontend is served under its own base path, e.g. `/offer`. */
function getCurrentModuleId(): ContentModuleId | undefined {
	const parsed = ContentModuleIdSchema.safeParse(window.location.pathname.split('/')[1]);
	return parsed.success ? parsed.data : undefined;
}

/* * */

export function useActiveBannersData(): UseActiveBannersDataReturnType {
	//

	//
	// A. Fetch data

	const { data, mutate } = useSWR<ApiResponse<BannerReader[]>>(API_ROUTES.core.BANNERS_ACTIVE, {
		fetcher: (url: string) => {
			const moduleId = getCurrentModuleId();
			return fetchApiData<BannerReader[]>({ url: moduleId ? `${url}?module_id=${moduleId}` : url });
		},
		refreshInterval: 60_000,
	});

	//
	// B. Handle actions

	const dismiss = useCallback(async (banner: BannerReader) => {
		await fetchApiData({
			body: { dismissal_version: banner.dismissal_version, module_id: getCurrentModuleId() },
			method: 'POST',
			url: API_ROUTES.core.BANNERS_DETAIL_DISMISS(banner._id),
		});
		await mutate();
	}, [mutate]);

	//
	// C. Return data

	return useMemo(() => ({ data: data?.data ?? [], dismiss }), [data?.data, dismiss]);
}
