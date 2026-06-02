'use client';

import { useAlertsContext } from '@/components/alerts/Alerts.context';
import { useLinesContext } from '@/components/lines/Lines.context';
import { useStopsContext } from '@/components/stops/Stops.context';
import { useOperationalDateContext } from '@/contexts/OperationalDate.context';
import { HubPattern, HubRoute, HubShape, HubWaypoint } from '@/types/api/network';
import { API_ROUTES } from '@tmlmobilidade/consts';
import { HubAlert, HubLine } from '@tmlmobilidade/types';
import { useQueryState } from 'nuqs';
import { createContext, useContext, useEffect, useState } from 'react';

/* * */

interface LinesDetailContextState {
	actions: {
		setActivePattern: (patternGroupId: string) => void
		setActiveWaypoint: (stopId: string, stopSequence: number) => void
		setHighlightedTripIds: (tripIds: string[]) => void
	}
	data: {
		active_alerts: HubAlert[] | undefined
		active_pattern: HubPattern | null
		active_shape: HubShape | null
		active_waypoint: HubWaypoint | null
		all_patterns: HubPattern[][] | null
		highlighted_trip_ids: null | string[]
		line: HubLine | undefined
		routes: HubRoute[]
		valid_patterns: HubPattern[] | undefined
	}
	filters: {
		active_pattern_id: null | string
		active_waypoint_stop_id: null | string
		active_waypoint_stop_sequence: null | string
	}
	flags: {
		is_interactive_mode: boolean
		is_loading: boolean
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

export const LinesDetailContextProvider = ({ children, lineId }) => {
	//

	//
	// A. Setup variables

	const linesContext = useLinesContext();
	const stopsContext = useStopsContext();
	const alertsContext = useAlertsContext();
	const operationalDateContext = useOperationalDateContext();

	const [dataLineState, setDataLineState] = useState<LinesDetailContextState['data']['line']>();
	const [dataRoutesState, setDataRoutesState] = useState<LinesDetailContextState['data']['routes']>([]);

	const [dataAllPatternsState, setDataAllPatternsState] = useState<LinesDetailContextState['data']['all_patterns']>(null);
	const [dataValidPatternsState, setDataValidPatternsState] = useState<LinesDetailContextState['data']['valid_patterns']>();
	const [dataActiveAlertsState, setDataActiveAlertsState] = useState<LinesDetailContextState['data']['active_alerts']>();
	const [dataActivePatternState, setDataActivePatternState] = useState<LinesDetailContextState['data']['active_pattern']>(null);
	const [dataActiveShapeState, setDataActiveShapeState] = useState<LinesDetailContextState['data']['active_shape']>(null);
	const [dataActiveWaypointState, setDataActiveWaypointState] = useState<LinesDetailContextState['data']['active_waypoint']>(null);
	const [dataHighlightedTripIdsState, setDataHighlightedTripIdsState] = useState<LinesDetailContextState['data']['highlighted_trip_ids']>([]);
	const [filterActivePatternIdState, setFilterActivePatternIdState] = useQueryState('active_pattern_id');
	const [filterActiveWaypointStopIdState, setFilterActiveWaypointStopIdState] = useQueryState('active_waypoint_stop_id');
	const [filterActiveWaypointStopSequenceState, setFilterActiveWaypointStopSequenceState] = useQueryState('active_waypoint_stop_sequence');

	const [flagIsInteractiveModeState, setFlagIsInteractiveModeState] = useState<LinesDetailContextState['flags']['is_interactive_mode']>(false);

	//
	// B. Fetch data

	useEffect(() => {
		const lineData = linesContext.actions.getLineDataById(lineId);
		if (!lineData) return;
		setDataLineState(lineData);
	}, [lineId, linesContext.actions, linesContext.data.lines]);

	useEffect(() => {
		if (!dataLineState?.route_ids) return;
		dataLineState.route_ids.forEach((routeId) => {
			const routeData = linesContext.actions.getRouteDataById(routeId);
			if (!routeData) return;
			setDataRoutesState(prev => [...prev, routeData]);
		});
	}, [dataLineState, linesContext.actions, linesContext.data.routes]);

	useEffect(() => {
		(async () => {
			try {
				if (!dataLineState) return;
				const fetchPromises = dataLineState.pattern_ids.map((patternId) => {
					return fetch(API_ROUTES.hub.NETWORK_PATTERNS(patternId))
						.then(response => response.json())
						.then((patternPayload) => {
							const patternData = Array.isArray(patternPayload) ? patternPayload : patternPayload.data ?? [];
							return patternData.map((patternGroup) => {
								patternGroup.path = patternGroup.path.map((waypoint) => {
									const stopData = stopsContext.actions.getStopById(waypoint.stop_id);
									if (!stopData) return waypoint;
									return { ...waypoint, stop: stopData };
								});
								return patternGroup;
							});
						});
				});
				const resultData = await Promise.all(fetchPromises);
				setDataAllPatternsState(resultData);
			} catch (error) {
				console.error('Error fetching pattern data:', error);
			}
		})();
	}, [dataLineState, stopsContext.actions, stopsContext.data.stops]);

	/**
	 * TASK: Fetch shape data for the active pattern.
	 * WHEN: The `dataActivePatternState` changes.
	 */
	useEffect(() => {
		if (!dataActivePatternState) return;
		(async () => {
			try {
				const shapeUrl = API_ROUTES.hub.NETWORK_PATTERNS(dataActivePatternState.shape_id).replace('/patterns/', '/shapes/');
				const shapeData = await fetch(shapeUrl).then((response) => {
					if (!response.ok) console.log(`Failed to fetch shape data for shapeId: ${dataActivePatternState.shape_id}`);
					else return response.json();
				}).then(shapePayload => shapePayload?.data ?? shapePayload);
				if (shapeData) {
					shapeData.geojson = {
						...shapeData.geojson,
						properties: {
							color: dataActivePatternState.color,
							text_color: dataActivePatternState.text_color,
						},
					};
				}
				setDataActiveShapeState(shapeData);
			} catch (error) {
				console.error('Error fetching shape data:', error);
			}
		})();
	}, [dataActivePatternState]);

	//
	// C. Transform data

	useEffect(() => {
		if (!dataAllPatternsState || !operationalDateContext.data.selected_date) return;
		const activePatterns: HubPattern[] = [];
		for (const pattern of dataAllPatternsState) {
			let closestDateSoFar: string = null;
			let patternGroupWithClosestDate: HubPattern = null;
			for (const patternGroup of pattern) {
				const selectedDate = operationalDateContext.data.selected_date.operational_date;
				if (!selectedDate) return;
				// Find the closest valid date
				const closestDate = patternGroup.valid_on.reduce((acc, curr) => {
					if (selectedDate <= curr && (acc === '' || curr < acc)) return curr;
					return acc;
				}, '');
				if (!closestDateSoFar) closestDateSoFar = closestDate;
				if (closestDate && closestDate <= closestDateSoFar) {
					patternGroupWithClosestDate = patternGroup;
					closestDateSoFar = closestDate;
				}
			}
			// If the closest date is valid, add the pattern group to the list
			if (patternGroupWithClosestDate && !activePatterns.find(activePattern => activePattern.id === patternGroupWithClosestDate.id)) {
				activePatterns.push(patternGroupWithClosestDate);
			}
		}
		const sortedPatterns = activePatterns.sort((a, b) => a.id.localeCompare(b.id));
		setDataValidPatternsState(sortedPatterns);
	}, [dataAllPatternsState, operationalDateContext.data.selected_date]);

	useEffect(() => {
		if (!alertsContext.data.alerts) return;

		const activeAlerts = alertsContext.data.alerts.filter((row) => {
			if (!alertsContext.actions.getAlertById(row._id).active_period_start_date && alertsContext.actions.getAlertById(row._id).active_period_end_date) return false;
			return row.references.some((reference) => {
				const normalizedLineId = lineId?.trim();
				const lineAgencyId = dataLineState?.agency_id?.trim();
				const informedAgencyId = reference.parent_id?.trim();

				if (informedAgencyId) {
					const lineArea = normalizedLineId?.match(/\d/)?.[0] ?? lineAgencyId?.slice(-1);
					const agencyOk = informedAgencyId === lineAgencyId || lineArea === informedAgencyId.slice(-1);
					if (!agencyOk) return false;
				}

				if (reference.parent_id != null) return reference.parent_id.trim() === normalizedLineId;

				if (reference.child_ids.length > 0) return dataLineState?.route_ids?.includes(reference.child_ids[0]);

				if (reference.parent_id != null) {
					return dataAllPatternsState?.some(pattern => pattern.some(patternGroup => patternGroup.path.some(waypoint => waypoint.stop_id === reference.parent_id)));
				}

				return true;
			});
		});

		setDataActiveAlertsState(activeAlerts);
	}, [alertsContext.data.alerts, lineId, dataLineState, dataAllPatternsState, alertsContext.actions]);

	//
	// D. Handle actions

	/**
	 * Preselect a Pattern if there is no filter value.
	 * Return otherwise.
	 */
	useEffect(() => {
		// Return early if no patterns are available
		if (!dataValidPatternsState?.length) return;
		// Preselect the first pattern of the valid patterns if there is no filter value
		if (!filterActivePatternIdState) {
			setActivePattern(dataValidPatternsState[0].version_id);
		}
	}, [dataValidPatternsState, filterActivePatternIdState]);

	/**
	 * Activate a given Pattern based on the filter value for active_pattern_id.
	 * This runs everytime the filter changes.
	 */
	useEffect(() => {
		// Return early if no patterns are available or no filter value for active_pattern_id
		if (!dataValidPatternsState || !filterActivePatternIdState) return;
		// If there is a filter value for active pattern, set the pattern with that ID
		const foundActivePatternData = dataValidPatternsState.find(activePattern => activePattern.id === filterActivePatternIdState);
		if (!foundActivePatternData) return;
		setDataActivePatternState(foundActivePatternData);
		//
	}, [dataValidPatternsState, filterActivePatternIdState]);

	/**
	 * Preselect a Waypoint if there is no filter value.
	 * Return otherwise.
	 */
	useEffect(() => {
		// Return early if there is no active pattern
		if (!dataActivePatternState) return;
		// Preselect the first waypoint of the active pattern if there is no filter value
		if (!filterActiveWaypointStopIdState) {
			if (!dataActivePatternState.path.length) return;
			const firstStopId = dataActivePatternState.path[0].stop_id;
			const firstStopSequence = dataActivePatternState.path[0].stop_sequence;
			setActiveWaypoint(firstStopId, firstStopSequence, false);
		}
	}, [dataActivePatternState, filterActiveWaypointStopIdState, filterActiveWaypointStopSequenceState]);

	/**
	 * Activate a given Waypoint based on the filter value for active_stop_id and active_stop_sequence.
	 * This runs everytime the filter changes.
	 */
	useEffect(() => {
		// Return early if no patterns are available or no filter value for active_stop_id and active_stop_sequence
		if (!dataActivePatternState || !filterActiveWaypointStopIdState) return;
		// If there is a filter value for active_stop_id AND active_stop_sequence, then set the waypoint with that id AND sequence
		if (filterActiveWaypointStopIdState && filterActiveWaypointStopSequenceState) {
			const foundWaypointData = dataActivePatternState.path.find(waypoint => waypoint.stop_id === filterActiveWaypointStopIdState && waypoint.stop_sequence === Number(filterActiveWaypointStopSequenceState));
			if (foundWaypointData) {
				setDataActiveWaypointState(foundWaypointData);
				setFilterActiveWaypointStopIdState(foundWaypointData.stop_id);
				setFilterActiveWaypointStopSequenceState(String(foundWaypointData.stop_sequence));
				return;
			}
		}
		// We purposely do not try to match only by stop_id or stop_sequence since it probably will not make sense to the user.
		// The first stop of the pattern _0 is completely different from the first stop of the pattern _1, but matches the stop_id.
		// In this case, we should reset the filter values and the active waypoint.
		setDataActiveWaypointState(null);
		setFilterActiveWaypointStopIdState(null);
		setFilterActiveWaypointStopSequenceState(null);
		//
	}, [dataActivePatternState, filterActiveWaypointStopIdState, filterActiveWaypointStopSequenceState, setFilterActiveWaypointStopIdState, setFilterActiveWaypointStopSequenceState]);

	/**
	 * Set the active pattern based on the pattern version id.
	 * @param patternVersionId
	 * @returns
	 */
	const setActivePattern = (patternVersionId: string) => {
		// Return early if there are no valid patterns
		if (!dataValidPatternsState) return;
		// Find the pattern data that matches the pattern version id
		const foundPatternData = dataValidPatternsState.find(validPattern => validPattern.version_id === patternVersionId);
		// Update the state
		if (foundPatternData) {
			setFilterActivePatternIdState(foundPatternData.id);
			setFlagIsInteractiveModeState(false);
		}
	};

	/**
	 * Set the active waypoint based on the stop id and stop sequence.
	 * Optionally reset the interactive mode.
	 * @param stopId
	 * @param stopSequence
	 * @param isInteractive
	 * @returns
	 */
	const setActiveWaypoint = (stopId: string, stopSequence: number, isInteractive = true) => {
		// Return early if active waypoint is already selected
		if (dataActiveWaypointState?.stop_id === stopId && dataActiveWaypointState?.stop_sequence === stopSequence) return;
		// Find the waypoint in the active pattern that matches the stop id and stop sequence
		const foundWaypoint = dataActivePatternState?.path.find(waypoint => waypoint.stop_id === stopId && waypoint.stop_sequence === stopSequence);
		// Update the state
		if (foundWaypoint) {
			setFilterActiveWaypointStopIdState(foundWaypoint.stop_id);
			setFilterActiveWaypointStopSequenceState(String(foundWaypoint.stop_sequence));
			setFlagIsInteractiveModeState(isInteractive);
		}
	};

	/**
	 * Set the highlighted trip ids.
	 * @param tripIds
	 * @returns
	 */
	const setHighlightedTripIds = (tripIds: string[]) => {
		if (tripIds === dataHighlightedTripIdsState) setDataHighlightedTripIdsState(null);
		else setDataHighlightedTripIdsState(tripIds);
	};

	//
	// E. Define context value

	const contextValue: LinesDetailContextState = {
		actions: {
			setActivePattern,
			setActiveWaypoint,
			setHighlightedTripIds,
		},
		data: {
			active_alerts: dataActiveAlertsState,
			active_pattern: dataActivePatternState,
			active_shape: dataActiveShapeState,
			active_waypoint: dataActiveWaypointState,
			all_patterns: dataAllPatternsState,
			highlighted_trip_ids: dataHighlightedTripIdsState,
			line: dataLineState,
			routes: dataRoutesState,
			valid_patterns: dataValidPatternsState,
		},
		filters: {
			active_pattern_id: filterActivePatternIdState,
			active_waypoint_stop_id: filterActiveWaypointStopIdState,
			active_waypoint_stop_sequence: filterActiveWaypointStopSequenceState,
		},
		flags: {
			is_interactive_mode: flagIsInteractiveModeState,
			is_loading: linesContext.flags.isLoading || stopsContext.flags.isLoading || dataRoutesState === null || dataAllPatternsState === null,
		},
	};

	//
	// F. Render components

	return (
		<LinesDetailContext.Provider value={contextValue}>
			{children}
		</LinesDetailContext.Provider>
	);

	//
};
