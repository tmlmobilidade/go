'use client';

import { useAgenciesContext } from '@/contexts/Agencies.context';
import { useSamsFavoritesContext } from '@/contexts/SamFavorites.context';
import { getSamSystemStatus } from '@/lib/sam-status';
import { API_ROUTES } from '@tmlmobilidade/consts';
import { type Sam, type SystemStatus, SystemStatusSchema, type UnixTimestamp } from '@tmlmobilidade/types';
import { useFilterStateList, type UseFilterStateListReturnType, useFilterStateString, type UseFilterStateStringReturnType } from '@tmlmobilidade/ui';
import { fetchData } from '@tmlmobilidade/utils';
import { parseAsInteger, useQueryState } from 'nuqs';
import { createContext, type PropsWithChildren, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import useSWR from 'swr';

/* * */

export type SamsListItem = Omit<Sam, 'analysis'> & {
	analysis?: Sam['analysis']
};

export interface SamsListContextState {
	actions: {
		setFavoritesEnabled: () => void
		setFilterSeenFirstAt: (value: null | UnixTimestamp) => void
		setFilterSeenLastAt: (value: null | UnixTimestamp) => void
		trackVisibleSamIds: (ids: number[]) => void
	}
	data: {
		filtered: SamsListItem[]
		raw: SamsListItem[]
		timelineById: Record<number, null | Sam['timeline_summary'] | undefined>
	}
	filters: {
		agency: UseFilterStateListReturnType
		apex_version: UseFilterStateListReturnType<string>
		search: UseFilterStateStringReturnType
		seen_first_at: null | UnixTimestamp
		seen_last_at: null | UnixTimestamp
		status: UseFilterStateListReturnType<SystemStatus>
	}
	flags: {
		error: Error | undefined
		favoritesEnabled: boolean
		loading: boolean
	}
}

/* * */

export const SamsListContext = createContext<SamsListContextState | undefined>(undefined);

interface SamTimelineSummaryListItem {
	_id: number
	timeline_summary: null | Sam['timeline_summary']
}

export const useSamsListContext = () => {
	const context = useContext(SamsListContext);
	if (!context) {
		throw new Error('useSamsListContext must be used within a SamsListContextProvider');
	}
	return context;
};

// --- Custom Hook splits out logic for clean separation
export function SamsListContextProvider({ children }: PropsWithChildren) {
	//

	//
	// A. Setup variables

	const [favoritesEnabled, setFavoritesEnabled] = useState<boolean>(false);
	const [timelineById, setTimelineById] = useState<Record<number, null | Sam['timeline_summary'] | undefined>>({});
	const filterSearch = useFilterStateString('search');
	const [debouncedFilterSearch, setDebouncedFilterSearch] = useState('');
	const inflightTimelineIdsRef = useRef<Set<number>>(new Set());
	const timelineByIdRef = useRef<Record<number, null | Sam['timeline_summary'] | undefined>>({});

	const filterStatusOptions = useMemo(() => {
		return SystemStatusSchema.options.map(status => ({
			checked: false,
			disabled: false,
			label: status,
			value: status,
		}));
	}, []);
	const filterStatus = useFilterStateList<SystemStatus>(
		'system_status',
		SystemStatusSchema.options,
		filterStatusOptions,
	);

	const [filterSeenFirstAt, setFilterSeenFirstAt] = useQueryState<number>('seen_first_at', parseAsInteger);
	const [filterSeenLastAt, setFilterSeenLastAt] = useQueryState<number>('seen_last_at', parseAsInteger);

	const normalizeApexVersion = useCallback(
		(value: null | string | undefined): null | string => {
			if (value == null) return null;
			const trimmed = value.trim();
			if (!trimmed) return null;
			return trimmed;
		},
		[],
	);

	useEffect(() => {
		const handle = window.setTimeout(() => {
			setDebouncedFilterSearch(filterSearch.value.trim());
		}, 100);
		return () => window.clearTimeout(handle);
	}, [filterSearch.value]);

	//

	const samsFavoritesContext = useSamsFavoritesContext();
	const agenciesContext = useAgenciesContext();
	const agencyIdsOrdered = agenciesContext.data.ids;

	const agencyOptions = useMemo(
		() =>
			agenciesContext.data.raw.map(item => ({
				checked: false,
				disabled: false,
				label: `${item._id} - ${item.name}`,
				value: item._id,
			})),
		[agenciesContext.data.raw],
	);

	const filterAgency = useFilterStateList('agency_id', agencyIdsOrdered, agencyOptions);

	//

	const baseQueryString = useMemo(() => {
		const params = new URLSearchParams();
		if (filterAgency.isActive && filterAgency.value.length)
			params.set('agency_ids', filterAgency.value.join(','));
		if (debouncedFilterSearch) params.set('search', debouncedFilterSearch);
		if (filterSeenFirstAt) params.set('seen_first_at', filterSeenFirstAt.toString());
		if (filterSeenLastAt) params.set('seen_last_at', filterSeenLastAt.toString());
		return params.toString();
	}, [debouncedFilterSearch, filterAgency.isActive, filterAgency.value, filterSeenFirstAt, filterSeenLastAt]);

	//

	const apexVersionsUrl = useMemo(() => {
		if (agenciesContext.flags.loading) return null;
		const base = `${API_ROUTES.controller.SAMS_LIST}/apex-versions`;
		return baseQueryString ? `${base}?${baseQueryString}` : base;
	}, [agenciesContext.flags.loading, baseQueryString]);

	const { data: apexVersionsData } = useSWR<string[], Error>(apexVersionsUrl);

	const apexVersionOptions = useMemo(
		() =>
			[
				...new Set(
					(apexVersionsData ?? [])
						.map(value => normalizeApexVersion(value))
						.filter((value): value is string => value != null),
				),
			].sort((a, b) => b.localeCompare(a, undefined, { numeric: true })),
		[apexVersionsData, normalizeApexVersion],
	);

	const filterApexVersion = useFilterStateList<string>(
		'latest_apex_version',
		apexVersionOptions,
		apexVersionOptions.map(item => ({ label: item, value: item })),
	);

	const normalizedFilterApexVersionValues = useMemo(
		() =>
			[
				...new Set(
					filterApexVersion.value
						.map(item => normalizeApexVersion(item))
						.filter((item): item is string => item != null),
				),
			],
		[filterApexVersion.value, normalizeApexVersion],
	);

	const effectiveApexVersionFilterValues = useMemo(() => {
		if (apexVersionOptions.length === 0) return [];
		const available = new Set(apexVersionOptions);
		const selectedAvailable = normalizedFilterApexVersionValues.filter(value => available.has(value));
		if (selectedAvailable.length === 0) return [];
		// If all available options are selected, do not restrict or write URL filter.
		if (selectedAvailable.length === apexVersionOptions.length) return [];
		return selectedAvailable;
	}, [apexVersionOptions, normalizedFilterApexVersionValues]);

	//

	const samsListQueryString = useMemo(() => {
		const params = new URLSearchParams(baseQueryString);
		if (effectiveApexVersionFilterValues.length)
			params.set('latest_apex_version', effectiveApexVersionFilterValues.join(','));
		return params.toString();
	}, [baseQueryString, effectiveApexVersionFilterValues]);

	//

	const samsListUrl = useMemo(() => {
		if (agenciesContext.flags.loading) return null;
		const base = API_ROUTES.controller.SAMS_BASE;
		return samsListQueryString ? `${base}?${samsListQueryString}` : base;
	}, [agenciesContext.flags.loading, samsListQueryString]);

	//

	const { data: allSamsData = [], error: allSamsError, isLoading: allSamsLoading } = useSWR<SamsListItem[], Error>(samsListUrl, {
		revalidateOnFocus: false,
		revalidateOnReconnect: false,
	});

	//

	const normalizedSamsData = useMemo<SamsListItem[]>(() => {
		return allSamsData.map(item => ({ ...item, latest_apex_version: normalizeApexVersion(item.latest_apex_version) }));
	}, [allSamsData, normalizeApexVersion]);

	useEffect(() => {
		timelineByIdRef.current = timelineById;
	}, [timelineById]);

	const fetchAnalysisByIds = useCallback(async (samIds: number[]) => {
		if (samIds.length === 0) return;

		for (const samId of samIds)
			inflightTimelineIdsRef.current.add(samId);

		try {
			const summaryResponse = await fetchData<SamTimelineSummaryListItem[]>(
				API_ROUTES.controller.SAMS_TIMELINE_SUMMARY,
				'POST',
				{ ids: samIds },
			);
			if (!summaryResponse.isOk?.() || !summaryResponse.data) {
				throw new Error(summaryResponse.error ?? 'Failed to fetch SAM timeline summary chunk.');
			}
			const summaryRows = summaryResponse.data;

			setTimelineById((prev) => {
				const next = { ...prev };
				for (const samId of samIds)
					if (next[samId] === undefined) next[samId] = null;
				for (const row of summaryRows)
					next[row._id] = row.timeline_summary ?? { months: [] };
				return next;
			});
		} catch (error) {
			console.error('[SamsList] Failed to fetch timeline summary.', { error, samIdsCount: samIds.length });
			// Keep already-rendered rows; missing timeline can retry on later visibility events.
		} finally {
			for (const samId of samIds)
				inflightTimelineIdsRef.current.delete(samId);
		}
	}, []);

	const trackVisibleSamIds = useCallback((ids: number[]) => {
		// Kept for backward compatibility with list row components.
		void ids;
	}, []);

	useEffect(() => {
		if (favoritesEnabled || normalizedSamsData.length === 0) return;

		const missingIds = normalizedSamsData
			.map(item => item._id)
			.filter((samId) => {
				if (timelineByIdRef.current[samId] !== undefined) return false;
				if (inflightTimelineIdsRef.current.has(samId)) return false;
				return true;
			});

		void fetchAnalysisByIds(missingIds);
	}, [favoritesEnabled, fetchAnalysisByIds, normalizedSamsData]);

	useEffect(() => {
		setTimelineById({});
		inflightTimelineIdsRef.current.clear();
	}, [samsListUrl]);

	//

	const samsDataWithComputedStatus = useMemo<SamsListItem[]>(() => {
		return normalizedSamsData.map(item => ({ ...item, system_status: getSamSystemStatus(item) }));
	}, [normalizedSamsData]);

	const samsDataWithLazyTimeline = useMemo(() => {
		return samsDataWithComputedStatus.map(item => ({
			...item,
			timeline_summary: timelineById[item._id],
		}));
	}, [samsDataWithComputedStatus, timelineById]);

	const favoriteSamsNormalized = useMemo(
		() =>
			(samsFavoritesContext.data.favoriteSams ?? []).map(item => ({
				...item,
				latest_apex_version: normalizeApexVersion(item.latest_apex_version),
			})),
		[samsFavoritesContext.data.favoriteSams, normalizeApexVersion],
	);

	//

	const listSourceRows = favoritesEnabled ? favoriteSamsNormalized : samsDataWithLazyTimeline;

	const filteredSamsData = useMemo(() => {
		if (!filterStatus.isActive || !filterStatus.value.length)
			return listSourceRows;
		return listSourceRows.filter(item =>
			filterStatus.value.includes(item.system_status),
		);
	}, [filterStatus.isActive, filterStatus.value, listSourceRows]);

	const listLoading = favoritesEnabled ? (allSamsLoading || samsFavoritesContext.flags.loading) : allSamsLoading;

	//

	const contextValue: SamsListContextState = useMemo(
		() => ({
			actions: {
				setFavoritesEnabled: () => setFavoritesEnabled(!favoritesEnabled),
				setFilterSeenFirstAt: value => setFilterSeenFirstAt(value as null | number),
				setFilterSeenLastAt: value => setFilterSeenLastAt(value as null | number),
				trackVisibleSamIds,
			},
			data: {
				filtered: filteredSamsData,
				raw: samsDataWithLazyTimeline,
				timelineById,
			},
			filters: {
				agency: filterAgency,
				apex_version: filterApexVersion,
				search: filterSearch,
				seen_first_at: (filterSeenFirstAt ?? null) as null | UnixTimestamp,
				seen_last_at: (filterSeenLastAt ?? null) as null | UnixTimestamp,
				status: filterStatus,
			},
			flags: {
				error: allSamsError,
				favoritesEnabled,
				loading: listLoading,
			},
		}),
		[
			allSamsError,
			favoritesEnabled,
			filterSearch,
			filterAgency,
			filterApexVersion,
			filterStatus,
			filterSeenFirstAt,
			filterSeenLastAt,
			filteredSamsData,
			listLoading,
			samsDataWithLazyTimeline,
			setFilterSeenFirstAt,
			setFilterSeenLastAt,
			timelineById,
			trackVisibleSamIds,
		],
	);

	//

	//
	// B. Render components
	return (
		<SamsListContext.Provider value={contextValue}>
			{children}
		</SamsListContext.Provider>
	);
}

