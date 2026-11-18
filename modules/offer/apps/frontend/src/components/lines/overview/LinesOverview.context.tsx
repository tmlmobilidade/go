'use client';

import { useLinesListContext } from '@/components/lines/list/LinesList.context';
import { PatternShapeMapInteractionState } from '@/types/lines-overview';
import { getPatternFeaturesAtEvent } from '@/utils/lines-overview';
import { type PatternsShapeMapItem } from '@tmlmobilidade/go-offer-pckg-types';
import { type MapLayerMouseEvent } from '@vis.gl/react-maplibre';
import { createContext, type PropsWithChildren, useContext, useEffect, useMemo, useState } from 'react';

import { useLinesOverviewPatternsData } from './use-lines-overview-patterns-data';

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
		patternsData: PatternsShapeMapItem[]
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

	const { data: patternsData, error: patternsError, isLoading } = useLinesOverviewPatternsData(agencyIds);
	const patternsLoading = linesListContext.flags.agenciesLoading || isLoading;

	//
	// B. Handle effects and actions

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
	// C. Return context value

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
	// D. Render components

	return (
		<LinesOverviewContext.Provider value={contextValue}>
			{children}
		</LinesOverviewContext.Provider>
	);
};
