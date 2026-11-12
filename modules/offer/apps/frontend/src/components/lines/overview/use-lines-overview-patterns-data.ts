'use client';

import { API_ROUTES } from '@tmlmobilidade/consts';
import { type PatternsShapeMapItem } from '@tmlmobilidade/go-offer-pckg-types';
import { type ApiResponse } from '@tmlmobilidade/go-types-shared';
import { fetchApiData } from '@tmlmobilidade/ui';
import { useEffect, useMemo, useState } from 'react';
import useSWR from 'swr';

/* * */

interface UseLinesOverviewPatternsDataReturnType {
	data: PatternsShapeMapItem[]
	error: Error | null
	isLoading: boolean
}

/* * */

/** Cache shape results by operator, including successful empty responses. */
export function useLinesOverviewPatternsData(agencyIds: string[]): UseLinesOverviewPatternsDataReturnType {
	//
	// A. Setup cache

	/**
	 * Cache patterns by agency.
	 * This allows us to avoid refetching agencies that were already loaded before.
	 */
	const [patternsByAgencyId, setPatternsByAgencyId] = useState<Record<string, PatternsShapeMapItem[]>>({});

	/**
	 * Important: this is separate from patternsByAgencyId because an agency may have zero patterns.
	 * Without this, agencies with empty results would be fetched again and again.
	 */
	const [loadedAgencyIds, setLoadedAgencyIds] = useState<string[]>([]);

	//
	// B. Compute which agencies still need to be fetched

	const missingAgencyIds = useMemo(() => {
		return agencyIds.filter(agencyId => !loadedAgencyIds.includes(agencyId));
	}, [agencyIds, loadedAgencyIds]);

	const patternsRequestKey = useMemo(() => {
		if (missingAgencyIds.length === 0) return null;

		return `${API_ROUTES.offer.PATTERNS_SHAPES}?${new URLSearchParams({ agency_ids: missingAgencyIds.join(',') }).toString()}`;
	}, [missingAgencyIds]);

	//
	// C. Fetch data

	const { data: fetchedPatternsData, error, isLoading: patternsRequestLoading } = useSWR<ApiResponse<PatternsShapeMapItem[]>>(patternsRequestKey, {
		fetcher: async url => await fetchApiData<PatternsShapeMapItem[]>({ url }),
	});

	const patternsError = useMemo(() => error ?? (fetchedPatternsData?.error ? new Error(fetchedPatternsData.error) : null), [error, fetchedPatternsData?.error]);

	//
	// D. Handle side effects and actions

	useEffect(() => {
		if (!fetchedPatternsData?.data || fetchedPatternsData.error || missingAgencyIds.length === 0) return;

		setPatternsByAgencyId((previousPatternsByAgencyId) => {
			const nextPatternsByAgencyId = { ...previousPatternsByAgencyId };

			for (const agencyId of missingAgencyIds) {
				nextPatternsByAgencyId[agencyId] = fetchedPatternsData?.data?.filter((pattern) => {
					return pattern.agency_id === agencyId;
				});
			}

			return nextPatternsByAgencyId;
		});

		setLoadedAgencyIds((previousLoadedAgencyIds) => {
			return Array.from(new Set([...previousLoadedAgencyIds, ...missingAgencyIds]));
		});
	}, [fetchedPatternsData, missingAgencyIds]);

	//
	// E. Return data

	const patternsData = useMemo(() => {
		return agencyIds.flatMap(agencyId => patternsByAgencyId[agencyId] ?? []);
	}, [agencyIds, patternsByAgencyId]);

	// Keep loading until agency defaults are ready and every selected agency's
	// response has been applied to the cache, including successful empty results.
	const patternsLoading = patternsRequestLoading || (!patternsError && missingAgencyIds.length > 0);

	return useMemo(() => ({
		data: patternsData,
		error: patternsError,
		isLoading: patternsLoading,
	}), [patternsData, patternsError, patternsLoading]);
}
