'use client';

import { useLinesListContext } from '@/components/lines/list/LinesList.context';
import { PatternShapeMapInteractionState } from '@/types/lines-overview';
import { getPatternFeaturesAtEvent } from '@/utils/lines-overview';
import { API_ROUTES } from '@tmlmobilidade/consts';
import { PatternShapeMapItem } from '@tmlmobilidade/types';
import { type MapLayerMouseEvent } from '@vis.gl/react-maplibre';
import { createContext, type PropsWithChildren, useContext, useEffect, useMemo, useState } from 'react';
import useSWR from 'swr';

/* * */

interface LinesOverviewContextState {
	actions: {
		handleMapClick: (event: MapLayerMouseEvent) => void
		setAgencyIds: (agencyIds: string[]) => void
		setHighlightedPatternIds: (patternIds: string[]) => void
		setHoverInfo: (hoverInfo: null | PatternShapeMapInteractionState) => void
		setPopupInfo: (popupInfo: null | PatternShapeMapInteractionState) => void
	}
	data: {
		highlightedPatternIds: string[]
		hitboxLayerId: string
		hoverInfo: null | PatternShapeMapInteractionState
		patternsData: PatternShapeMapItem[]
		patternsError: Error | null
		patternsLoading: boolean
		popupInfo: null | PatternShapeMapInteractionState
	}
}

/* * */

const LinesOverviewContext = createContext<LinesOverviewContextState | undefined>(undefined);

export function useLinesOverviewContext() {
	const context = useContext(LinesOverviewContext);

	if (!context) {
		throw new Error('useLinesOverviewContext must be used within a LinesOverviewContextProvider');
	}

	return context;
}

/* * */

const HITBOX_LAYER_ID = 'lines-patterns-map:hitbox';

export const LinesOverviewContextProvider = ({ children }: PropsWithChildren) => {
	//
	// A. Setup state

	const linesListContext = useLinesListContext();
	const agencyIds = linesListContext.filters.agencies.value;

	const [hoverInfo, setHoverInfo] = useState<null | PatternShapeMapInteractionState>(null);
	const [highlightedPatternIds, setHighlightedPatternIds] = useState<string[]>([]);
	const [popupInfo, setPopupInfo] = useState<null | PatternShapeMapInteractionState>(null);

	/**
	 * Cache patterns by agency.
	 * This allows us to avoid refetching agencies that were already loaded before.
	 */
	const [patternsByAgencyId, setPatternsByAgencyId] = useState<Record<string, PatternShapeMapItem[]>>({});

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

		return API_ROUTES.offer.PATTERNS_SHAPES(missingAgencyIds.join(','));
	}, [missingAgencyIds]);

	//
	// C. Fetch data

	const { data: fetchedPatternsData, error: patternsError, isLoading: patternsLoading } = useSWR<PatternShapeMapItem[]>(patternsRequestKey);

	//
	// D. Handle side effects and actions

	useEffect(() => {
		if (!fetchedPatternsData || missingAgencyIds.length === 0) return;

		setPatternsByAgencyId((previousPatternsByAgencyId) => {
			const nextPatternsByAgencyId = { ...previousPatternsByAgencyId };

			for (const agencyId of missingAgencyIds) {
				nextPatternsByAgencyId[agencyId] = fetchedPatternsData.filter((pattern) => {
					return pattern.agency_id === agencyId;
				});
			}

			return nextPatternsByAgencyId;
		});

		setLoadedAgencyIds((previousLoadedAgencyIds) => {
			return Array.from(new Set([...previousLoadedAgencyIds, ...missingAgencyIds]));
		});
	}, [fetchedPatternsData, missingAgencyIds]);

	useEffect(() => {
		setHighlightedPatternIds([]);
		setHoverInfo(null);
		setPopupInfo(null);
	}, [agencyIds]);

	const handleMapClick = (event: MapLayerMouseEvent) => {
		const features = getPatternFeaturesAtEvent(event, HITBOX_LAYER_ID);
		if (!features.length) {
			setHighlightedPatternIds([]);
			setPopupInfo(null);
			return;
		}

		setHighlightedPatternIds(features.map(feature => feature.pattern_id));
		setPopupInfo({
			features,
			latitude: event.lngLat.lat,
			longitude: event.lngLat.lng,
		});
	};

	//
	// E. Transform data

	const patternsData = useMemo(() => {
		return agencyIds.flatMap(agencyId => patternsByAgencyId[agencyId] ?? []);
	}, [agencyIds, patternsByAgencyId]);

	const contextValue: LinesOverviewContextState = useMemo(() => ({
		actions: {
			handleMapClick,
			setAgencyIds: linesListContext.filters.agencies.set,
			setHighlightedPatternIds,
			setHoverInfo,
			setPopupInfo,
		},
		data: {
			highlightedPatternIds,
			hitboxLayerId: HITBOX_LAYER_ID,
			hoverInfo,
			patternsData,
			patternsError,
			patternsLoading,
			popupInfo,
		},
	}), [highlightedPatternIds, hoverInfo, popupInfo, patternsData, patternsError, patternsLoading, linesListContext.filters.agencies.set, setHighlightedPatternIds, setHoverInfo, setPopupInfo]);

	//
	// F. Render components

	return (
		<LinesOverviewContext.Provider value={contextValue}>
			{children}
		</LinesOverviewContext.Provider>
	);
};
