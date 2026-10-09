'use client';

import { useLineDetailData } from '@/components/lines/detail/use-line-detail-data';
import { useLineDetailShapeData } from '@/components/lines/detail/use-line-detail-shape-data';
import { type HubV1ApiAlert, type HubV1ApiLine, type HubV1ApiPattern, type HubV1ApiPatternWaypoint, type HubV1ApiRoute } from '@tmlmobilidade/go-types-hub';
import { createContext, type PropsWithChildren, useCallback, useContext, useEffect, useMemo, useState } from 'react';

/* * */

interface LinesDetailContextState {
	actions: {
		setActivePattern: (patternGroupId: string) => void
		setActiveWaypoint: (stopId: string, stopSequence: number) => void
		setHighlightedTripIds: (tripIds: string[]) => void
	}
	data: {
		active_alerts: HubV1ApiAlert[] | undefined
		active_pattern: HubV1ApiPattern | null
		active_shape: GeoJSON.Feature<GeoJSON.LineString> | null
		active_waypoint: HubV1ApiPatternWaypoint | null
		all_patterns: HubV1ApiPattern[][] | null
		highlighted_trip_ids: null | string[]
		line: HubV1ApiLine | undefined
		routes: HubV1ApiRoute[]
		valid_patterns: HubV1ApiPattern[] | undefined
	}
	filters: {
		active_pattern_version_id: null | string
		active_waypoint_stop_id: null | string
		active_waypoint_stop_sequence: null | string
	}
	flags: {
		has_error: boolean
		is_interactive_mode: boolean
		is_loading: boolean
		is_not_found: boolean
	}
}

/* * */

const LinesDetailContext = createContext<LinesDetailContextState | undefined>(undefined);

export function useLinesDetailContext() {
	const context = useContext(LinesDetailContext);
	if (!context) {
		throw new Error('useLinesDetailContext must be used within a LinesDetailContextProvider');
	}
	return context;
}

/* * */

export function LinesDetailContextProvider({ children, lineId }: PropsWithChildren<{ lineId: null | string }>) {
	//

	//
	// A. Setup variables

	const [activePatternVersionId, setActivePatternVersionId] = useState<null | string>(null);
	const [activeWaypointStopId, setActiveWaypointStopId] = useState<null | string>(null);
	const [activeWaypointStopSequence, setActiveWaypointStopSequence] = useState<null | string>(null);
	const [highlightedTripIds, setHighlightedTripIdsState] = useState<null | string[]>([]);
	const [isInteractiveMode, setIsInteractiveMode] = useState(false);

	//
	// B. Fetch data

	const { activeAlerts, allPatterns, hasError, isLoading, isNotFound, line, routes, validPatterns } = useLineDetailData(lineId);

	//
	// C. Transform data

	const activePattern = useMemo(() => validPatterns?.find(pattern => pattern.version_id === activePatternVersionId) ?? null, [activePatternVersionId, validPatterns]);
	const activeShape = useLineDetailShapeData(activePattern);
	const activeWaypoint = useMemo(() => {
		if (!activePattern || !activeWaypointStopId || !activeWaypointStopSequence) return null;
		return activePattern.path.find(waypoint => waypoint.stop_id === activeWaypointStopId && waypoint.stop_sequence === Number(activeWaypointStopSequence)) ?? null;
	}, [activePattern, activeWaypointStopId, activeWaypointStopSequence]);

	//
	// D. Synchronize selected state

	// Reset interactions when navigating to a different line.
	useEffect(() => {
		setActivePatternVersionId(null);
		setActiveWaypointStopId(null);
		setActiveWaypointStopSequence(null);
		setHighlightedTripIdsState([]);
		setIsInteractiveMode(false);
	}, [lineId]);

	// Keep the selected pattern when its version changes with the operational date.
	useEffect(() => {
		if (!validPatterns?.length || validPatterns.some(pattern => pattern.version_id === activePatternVersionId)) return;
		const previousPatternId = allPatterns?.flat().find(pattern => pattern.version_id === activePatternVersionId)?._id;
		const matchingPattern = validPatterns.find(pattern => pattern._id === previousPatternId);
		const nextPattern = matchingPattern ?? validPatterns.find(pattern => pattern.path.length > 0) ?? validPatterns[0];
		setActivePatternVersionId(nextPattern.version_id);
		setIsInteractiveMode(false);
	}, [activePatternVersionId, allPatterns, validPatterns]);

	// Select the first waypoint when the active pattern has no selection.
	useEffect(() => {
		if (!activePattern || activeWaypointStopId) return;
		const firstWaypoint = activePattern.path[0];
		if (!firstWaypoint) return;
		setActiveWaypointStopId(firstWaypoint.stop_id);
		setActiveWaypointStopSequence(String(firstWaypoint.stop_sequence));
		setIsInteractiveMode(false);
	}, [activePattern, activeWaypointStopId]);

	// Clear a waypoint that no longer belongs to the active pattern.
	useEffect(() => {
		if (!activePattern || !activeWaypointStopId) return;
		if (activeWaypoint) return;
		setActiveWaypointStopId(null);
		setActiveWaypointStopSequence(null);
	}, [activePattern, activeWaypoint, activeWaypointStopId]);

	//
	// E. Handle actions

	const setActivePattern = useCallback((patternVersionId: string) => {
		const pattern = validPatterns?.find(candidate => candidate.version_id === patternVersionId);
		if (!pattern) return;
		setActivePatternVersionId(pattern.version_id);
		setActiveWaypointStopId(null);
		setActiveWaypointStopSequence(null);
		setIsInteractiveMode(false);
	}, [validPatterns]);

	const setActiveWaypoint = useCallback((stopId: string, stopSequence: number, isInteractive = true) => {
		if (activeWaypoint?.stop_id === stopId && activeWaypoint.stop_sequence === stopSequence) return;
		const waypoint = activePattern?.path.find(candidate => candidate.stop_id === stopId && candidate.stop_sequence === stopSequence);
		if (!waypoint) return;
		setActiveWaypointStopId(waypoint.stop_id);
		setActiveWaypointStopSequence(String(waypoint.stop_sequence));
		setIsInteractiveMode(isInteractive);
	}, [activePattern, activeWaypoint]);

	const setHighlightedTripIds = useCallback((tripIds: string[]) => {
		if (tripIds === highlightedTripIds) setHighlightedTripIdsState(null);
		else setHighlightedTripIdsState(tripIds);
	}, [highlightedTripIds]);

	//
	// F. Define context value

	const contextValue = useMemo<LinesDetailContextState>(() => ({
		actions: {
			setActivePattern,
			setActiveWaypoint,
			setHighlightedTripIds,
		},
		data: {
			active_alerts: activeAlerts,
			active_pattern: activePattern,
			active_shape: activeShape,
			active_waypoint: activeWaypoint,
			all_patterns: allPatterns,
			highlighted_trip_ids: highlightedTripIds,
			line,
			routes,
			valid_patterns: validPatterns,
		},
		filters: {
			active_pattern_version_id: activePatternVersionId,
			active_waypoint_stop_id: activeWaypointStopId,
			active_waypoint_stop_sequence: activeWaypointStopSequence,
		},
		flags: {
			has_error: hasError,
			is_interactive_mode: isInteractiveMode,
			is_loading: isLoading,
			is_not_found: isNotFound,
		},
	}), [activeAlerts, activePattern, activePatternVersionId, activeShape, activeWaypoint, activeWaypointStopId, activeWaypointStopSequence, allPatterns, hasError, highlightedTripIds, isInteractiveMode, isLoading, isNotFound, line, routes, setActivePattern, setActiveWaypoint, setHighlightedTripIds, validPatterns]);

	//
	// G. Render components

	return (
		<LinesDetailContext.Provider value={contextValue}>
			{children}
		</LinesDetailContext.Provider>
	);

	//
}
