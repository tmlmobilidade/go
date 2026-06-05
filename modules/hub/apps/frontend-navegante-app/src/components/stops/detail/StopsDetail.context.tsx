'use client';
/* * */

import { useAlertsContext } from '@/components/alerts/Alerts.context';
import { useOperationalDateContext } from '@/components/common/operational-date/OperationalDate.context';
import { useLinesContext } from '@/components/lines/Lines.context';
import { parseEtaGtfsForStop, type StopTimetableRealtimeArrival } from '@/components/stops/detail/parse-eta-gtfs';
import { useStopsContext } from '@/components/stops/Stops.context';
import { API_ROUTES } from '@tmlmobilidade/consts';
import { type HubAlert, HubArrival, type HubGtfsRtFeedMessage, type HubLine, type HubPattern, type HubShape, type HubStop } from '@tmlmobilidade/types';
import { DateTime } from 'luxon';
import { createContext, useContext, useEffect, useState } from 'react';

/* * */

interface StopsDetailContextState {
	actions: {
		resetActiveTripId: () => void
		setActiveTripId: (tripId: string, stopSequence: number) => void
	}
	data: {
		active_alerts: HubAlert[] | undefined
		active_pattern_group: HubPattern | undefined
		active_shape: HubShape | undefined
		active_stop_id: string
		active_stop_sequence: number | undefined
		active_trip_id: string | undefined
		lines: HubLine[] | undefined
		patterns: HubPattern[][] | undefined
		stop: HubStop | undefined
		timetable_realtime: StopTimetableRealtimeArrival[] | undefined
		timetable_realtime_future: StopTimetableRealtimeArrival[] | undefined
		timetable_realtime_go: StopTimetableRealtimeArrival[] | undefined
		timetable_realtime_past: StopTimetableRealtimeArrival[] | undefined
		timetable_schedule: HubArrival[] | undefined
		valid_pattern_groups: HubPattern[] | undefined
	}
	filters: {
		none: string | undefined
	}
	flags: {
		is_loading: boolean
		is_loading_timetable: boolean
	}
}

/* * */

const StopsDetailContext = createContext<StopsDetailContextState | undefined>(undefined);

export function useStopsDetailContext() {
	const context = useContext(StopsDetailContext);
	if (!context) {
		throw new Error('useStopsDetailContext must be used within a StopsDetailContextProvider');
	}
	return context;
}

/* * */

export const StopsDetailContextProvider = ({ children, stopId }: { children: React.ReactNode, stopId: string }) => {
	//

	//
	// A. Setup variables

	const stopsContext = useStopsContext();
	const linesContext = useLinesContext();
	const alertsContext = useAlertsContext();
	const operationalDateContext = useOperationalDateContext();
	const [dataStopState, setDataStopState] = useState<HubStop | undefined>(undefined);
	const [dataLinesState, setDataLinesState] = useState<HubLine[] | undefined>(undefined);
	const [dataPatternsState, setDataPatternsState] = useState<HubPattern[][] | undefined>(undefined);
	const [dataValidPatternsState, setDataValidPatternsState] = useState<HubPattern[] | undefined>(undefined);
	const [dataShapeState, setDataShapeState] = useState<HubShape | undefined>(undefined);
	const [dataArrivalsGo, setDataArrivalsGo] = useState<StopTimetableRealtimeArrival[] | undefined>(undefined);
	const [dataTimetableRealtimeState, setDataTimetableRealtimeState] = useState<StopTimetableRealtimeArrival[] | undefined>(undefined);
	const [dataTimetableRealtimePastState, setDataTimetableRealtimePastState] = useState<StopTimetableRealtimeArrival[] | undefined>(undefined);
	const [dataTimetableRealtimeFutureState, setDataTimetableRealtimeFutureState] = useState<StopTimetableRealtimeArrival[] | undefined>(undefined);
	const [dataTimetableScheduleState, setDataTimetableScheduleState] = useState<HubArrival[] | undefined>(undefined);
	const [dataActivePatternState, setDataActivePatternState] = useState<HubPattern | undefined>(undefined);
	const [dataActiveAlertsState, setDataActiveAlertsState] = useState<HubAlert[] | undefined>(undefined);
	const [dataActiveTripIdState, setDataActiveTripIdState] = useState<string | undefined>(undefined);
	const [dataActiveStopSequenceState, setDataActiveStopSequenceState] = useState<number | undefined>(undefined);

	//
	// B. Fetch data

	/**
 	* Populate stopData state when stopId changes.
 	* Use data from stopsContext to avoid fetching the same data twice.
 	*/

	useEffect(() => {
		if (!stopId || !stopsContext.data.stops?.length) return;
		const foundStopData = stopsContext.actions.getStopById(stopId);
		if (foundStopData) setDataStopState(foundStopData);
	}, [stopsContext.data.stops, stopId]);

	/**
 	* Fetch line data for the selected stop.
 	* This effect runs whenever the `dataStopState` changes.
 	* It fetches line data for each line associated with the stop and updates the state.
 	*/

	useEffect(() => {
		if (!dataStopState) return;
		const linesData = dataStopState.line_ids
			.map(lineId => linesContext.data.lines.find(line => line._id === lineId))
			.filter(lineData => lineData !== undefined);
		setDataLinesState(linesData);
	}, [dataStopState, linesContext.data.lines]);

	/**
	 * Fetch GTFS-RT ETA feed and parse arrivals for the selected stop.
	 */

	useEffect(() => {
		const fetchData = async () => {
			try {
				if (!stopId) return;

				// 1. Fetch GTFS-RT JSON feed
				const response = await fetch('https://go.tmlmobilidade.pt/hub/api/v1/realtime/eta/gtfs');
				if (!response.ok) {
					console.log(`Failed to fetch realtime data for stopId: ${stopId}`);
					return;
				}

				// 2. Parse feed into arrivals for this stop
				const feed: HubGtfsRtFeedMessage = await response.json();
				const arrivals = parseEtaGtfsForStop(
					feed.entity,
					stopId,
					dataValidPatternsState,
				);

				// 3. Store raw arrivals; prepareTimetableRealtimeData splits past/future
				setDataTimetableRealtimeState(arrivals);
			} catch (error) {
				console.error('Error fetching realtime data:', error);
				setDataTimetableRealtimeState([]);
			}
		};

		fetchData();
		const interval = setInterval(fetchData, 10000);
		return () => clearInterval(interval);
	}, [stopId, dataValidPatternsState]);

	/**
	* Fetch realtime arrivals data for the selected stop from GO API.
	* This effect runs whenever the `dataStopState` changes.
	* It fetches line data for each line associated with the stop and updates the state.
	*/

	// useEffect(() => {
	// 	const fetchData = async () => {
	// 		try {
	// 			if (!stopId) return;
	// 			const realtimeData = await fetch('https://go.tmlmobilidade.pt/hub/api/v1/realtime/eta/)
	// 				.then((response) => {
	// 					if (!response.ok) console.log(`Failed to fetch realtime data for stopId: ${stopId}`);
	// 					else return response.json();
	// 				});
	// 			setDataArrivalsGo(realtimeData);
	// 		} catch (error) {
	// 			console.error('Error fetching realtime data:', error);
	// 			setDataArrivalsGo([]);
	// 		}
	// 	};
	//
	// 	fetchData();
	// 	const interval = setInterval(fetchData, 10000);
	// 	return () => clearInterval(interval);
	// }, [stopId]);

	/**
 	* Fetch pattern data for the selected stop.
 	* This effect runs whenever the `dataStopState` changes.
 	* It fetches pattern data for each pattern associated with the stop and updates the state.
 	*/

	useEffect(() => {
		if (!dataStopState) return;
		(async () => {
			try {
				const patternsData = await Promise.all(dataStopState.pattern_ids.map((patternId) => {
					return fetch(API_ROUTES.hub.NETWORK_PATTERNS(patternId))
						.then((response) => {
							if (!response.ok) {
								console.log(`Failed to fetch pattern data for patternId: ${patternId}`);
								return [];
							}
							return response.json();
						})
						.then((patternPayload) => {
							const patternData = Array.isArray(patternPayload) ? patternPayload : patternPayload?.data ?? [];
							return Array.isArray(patternData) ? patternData : patternData ? [patternData] : [];
						});
				}));
				setDataPatternsState(patternsData);
			} catch (error) {
				console.error('Error fetching all pattern data:', error);
			}
		})();
	}, [dataStopState]);

	/**
 	* TASK: Fetch shape data for the active trip.
 	* WHEN: The `dataActivePatternState` changes.
 	*/

	useEffect(() => {
		if (!dataActivePatternState) return;
		(async () => {
			try {
				const shapeData = await fetch(`${API_ROUTES.hub.NETWORK_SHAPES(dataActivePatternState.shape_id)}`).then((response) => {
					if (!response.ok) console.log(`Failed to fetch shape data for shapeId: ${dataActivePatternState.shape_id}`);
					else return response.json();
				});
				if (shapeData) {
					shapeData.geojson = {
						...shapeData.geojson,
						properties: {
							color: dataActivePatternState.color,
							text_color: dataActivePatternState.text_color,
						},
					};
				}
				setDataShapeState(shapeData);
			} catch (error) {
				console.error('Error fetching shape data:', error);
			}
		})();
	}, [dataActivePatternState]);

	//

	// C. Transform data

	/**
	 * Split raw GTFS arrivals into past and future lists for the timetable view.
	 *
	 * Called from: StopsDetailContextProvider (runs every second)
	 */

	useEffect(() => {
		const prepareTimetableRealtimeData = () => {
			if (!dataTimetableRealtimeState) return;
			const nowInUnixSeconds = DateTime.now().toSeconds();
			const timetableRealtimePastResult = dataTimetableRealtimeState
				.filter((arrival) => {
					if (arrival.observed_arrival_unix) return true;
					return (arrival.estimated_arrival_unix || arrival.scheduled_arrival_unix) < nowInUnixSeconds;
				})
				.sort((a, b) => {
					const minimumArrivalA = a.observed_arrival_unix || a.scheduled_arrival_unix;
					const minimumArrivalB = b.observed_arrival_unix || b.scheduled_arrival_unix;
					return minimumArrivalA - minimumArrivalB;
				});
			const timetableRealtimeFutureResult = dataTimetableRealtimeState
				.filter((arrival) => {
					if (arrival.observed_arrival_unix) return false;
					return (arrival.estimated_arrival_unix || arrival.scheduled_arrival_unix) >= nowInUnixSeconds;
				})
				.sort((a, b) => {
					const minimumArrivalA = a.estimated_arrival_unix || a.scheduled_arrival_unix;
					const minimumArrivalB = b.estimated_arrival_unix || b.scheduled_arrival_unix;
					return minimumArrivalA - minimumArrivalB;
				});
			setDataTimetableRealtimePastState(timetableRealtimePastResult || []);
			setDataTimetableRealtimeFutureState(timetableRealtimeFutureResult || []);
		};
		prepareTimetableRealtimeData();
		const interval = setInterval(prepareTimetableRealtimeData, 1000);
		return () => clearInterval(interval);
	}, [dataTimetableRealtimeState]);

	/**
 	* Prepare timetable schedule data for the selected stop.
 	*/

	useEffect(() => {
		// Return if no valid pattern groups or operational day is selected
		if (!operationalDateContext.data.selected_date || !dataValidPatternsState) return;

		const validScheduledTrips: HubArrival[] = [];

		for (const patternGroup of dataValidPatternsState || []) {
			for (const trip of patternGroup.trips) {
				if (!trip.valid_on.includes(operationalDateContext.data.selected_date.operational_date)) continue;
				for (const stopTime of trip.schedule) {
					if (String(stopTime.stop_id) !== String(stopId)) continue;

					validScheduledTrips.push({
						arrival_time: stopTime.arrival_time,
						arrival_time_24h: stopTime.arrival_time_24h,
						line_id: patternGroup.line_id,
						pattern_id: patternGroup.id,
						stop_id: stopId,
						stop_sequence: stopTime.stop_sequence,
						trip_id: trip.trip_ids[0] ?? stopTime.trip_id ?? '',
					});
				}
			}
		}

		validScheduledTrips.sort((a, b) => (a.arrival_time.localeCompare(b.arrival_time)));

		setDataTimetableScheduleState(validScheduledTrips);
	}, [operationalDateContext.data.selected_date, dataValidPatternsState, stopId]);

	/**
 	* Fill state with valid pattern groups for the selected operational day.
	*/

	useEffect(() => {
		if (!dataPatternsState || !operationalDateContext.data.selected_date) return;
		const selectedDate = operationalDateContext.data.selected_date.operational_date;
		const activePatterns = dataPatternsState
			.flat()
			.filter(patternGroup => patternGroup.valid_on.includes(selectedDate));
		setDataValidPatternsState(activePatterns);
	}, [dataPatternsState, operationalDateContext.data.selected_date]);

	useEffect(() => {
		if (!alertsContext.data.alerts) return;
		const activeAlerts = alertsContext.data.alerts.filter((alert) => {
			return alert.references.some((reference) => {
				if (!reference.parent_id && !reference.child_ids.length) return false;
				const hasMatchingStop = reference.parent_id === stopId;
				const hasMatchingRoute = dataStopState?.route_ids.includes(reference.child_ids[0] || '');
				return (hasMatchingStop || hasMatchingRoute) && alert.active_period_start_date <= DateTime.now().toUnixInteger() && alert.active_period_end_date >= DateTime.now().toUnixInteger();
			});
		});
		setDataActiveAlertsState(activeAlerts);
	}, [alertsContext.data.alerts, dataStopState, stopId]);

	//
	// D. Handle actions

	const setActiveTripId = (tripId: string, stopSequence: number) => {
		const activePattern = dataValidPatternsState?.find(patternGroup => patternGroup.trips.find(trip => trip.trip_ids.includes(tripId)));
		if (activePattern) {
			setDataActivePatternState(activePattern);
		}
		setDataActiveTripIdState(tripId);
		setDataActiveStopSequenceState(stopSequence);
	};

	const resetActiveTripId = () => {
		setDataActivePatternState(undefined);
		setDataActiveTripIdState(undefined);
		setDataShapeState(undefined);
		setDataActiveStopSequenceState(undefined);
	};

	//
	// E. Define context value

	const contextValue: StopsDetailContextState = {
		actions: {
			resetActiveTripId,
			setActiveTripId,
		},
		data: {
			active_alerts: dataActiveAlertsState,
			active_pattern_group: dataActivePatternState,
			active_shape: dataShapeState,
			active_stop_id: stopId,
			active_stop_sequence: dataActiveStopSequenceState,
			active_trip_id: dataActiveTripIdState,
			lines: dataLinesState,
			patterns: dataPatternsState,
			stop: dataStopState,
			timetable_realtime: dataTimetableRealtimeState,
			timetable_realtime_future: dataTimetableRealtimeFutureState,
			timetable_realtime_go: dataArrivalsGo,
			timetable_realtime_past: dataTimetableRealtimePastState,
			timetable_schedule: dataTimetableScheduleState,
			valid_pattern_groups: dataValidPatternsState,
		},
		filters: {
			none: undefined,
		},
		flags: {
			is_loading: dataPatternsState === undefined,
			is_loading_timetable: dataPatternsState === undefined || dataTimetableRealtimeState === undefined,
		},
	};

	//
	// F. Render components

	return (
		<StopsDetailContext.Provider value={contextValue}>
			{children}
		</StopsDetailContext.Provider>
	);

	//
};
