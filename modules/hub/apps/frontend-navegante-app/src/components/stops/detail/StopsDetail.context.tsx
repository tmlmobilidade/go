'use client';

import { useOperationalDate } from '@/components/common/operational-date/use-operational-date';
import { useLinesContext } from '@/components/lines/Lines.context';
import { useStopsContext } from '@/components/stops/Stops.context';
import { useTripUpdatesContext } from '@/components/trip-updates/TripUpdates.context';
import { fetchPatterns } from '@/utils/fetch-patterns';
import { Dates } from '@tmlmobilidade/dates';
import { type HubLine, type HubPattern, type HubStop, type UnixTimestamp } from '@tmlmobilidade/types';
import { convertGTFSTimeStringAndOperationalDateToUnixTimestamp } from '@tmlmobilidade/utils';
import { createContext, PropsWithChildren, useContext, useEffect, useMemo, useState } from 'react';

/* * */

export interface StopsDetailViewTimetableData {
	_id: string
	agency_id: string
	arrival_delay_ms: number
	arrival_effective_ms: null | UnixTimestamp
	arrival_estimated_ms: null | UnixTimestamp
	arrival_scheduled_ms: UnixTimestamp
	color: string
	headsign: string
	is_first_stop: boolean
	is_last_stop: boolean
	is_past: boolean
	is_realtime: boolean
	line_id: string
	pattern_id: string
	shape_id: string
	short_name: string
	stop_sequence: number
	text_color: string
	trip_ids: string[]
	tts_headsign: string
}

interface StopsDetailContextState {
	actions: {
		resetActiveTripId: () => void
		setActiveTripId: (tripId: string, stopSequence: number) => void
	}
	data: {
		associated_lines: HubLine[]
		highlighted_pattern: HubPattern
		highlighted_stop_sequence: number
		highlighted_trip_id: string
		stop: HubStop
		timetable: StopsDetailViewTimetableData[]
	}
	flags: {
		is_loading: boolean
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

export function StopsDetailContextProvider({ children, stopId }: PropsWithChildren<{ stopId: string }>) {
	//

	//
	// A. Setup variables

	const stopsContext = useStopsContext();
	const linesContext = useLinesContext();
	const operationalDate = useOperationalDate();
	const tripUpdatesContext = useTripUpdatesContext();

	const [isLoading, setIsLoading] = useState<boolean>(false);

	const [associatedPatternsData, setAssociatedPatternsData] = useState<HubPattern[][]>();

	const [highlightedPattern, setHighlightedPattern] = useState<HubPattern>();
	const [highlightedTripId, setHighlightedTripId] = useState<string>();
	const [highlightedStopSequence, setHighlightedStopSequence] = useState<number>();

	//
	// B. Fetch data

	const selectedStopData = useMemo(() => {
		if (!stopId || !stopsContext.data.stops?.length) return;
		return stopsContext.actions.getStopById(stopId);
	}, [stopId, stopsContext.data.stops, stopsContext.actions]);

	const associatedLinesData = useMemo(() => {
		if (!selectedStopData) return;
		return linesContext.data.lines.filter(line => selectedStopData.line_ids.includes(line._id));
	}, [linesContext.data.lines, selectedStopData]);

	useEffect(() => {
		(async () => {
			if (!selectedStopData) return;
			setIsLoading(true);
			const patternsData = await fetchPatterns(selectedStopData.pattern_ids);
			setAssociatedPatternsData(patternsData);
			setIsLoading(false);
		})();
	}, [selectedStopData]);

	//
	// C. Transform data

	const validPatternsData = useMemo(() => {
		// Skip if no associated patterns data or no operational date is selected
		if (!associatedPatternsData || !operationalDate.selectedOperationalDate) return;
		// Return patterns with trips on the selected operational date
		return associatedPatternsData
			.flat()
			.filter(patternGroup => patternGroup.valid_on.includes(operationalDate.selectedOperationalDate));
	}, [associatedPatternsData, operationalDate.selectedOperationalDate]);

	const timetableDataForSelectedDate = useMemo(() => {
		// Skip if no valid patterns data or no operational date is selected
		if (!validPatternsData || !operationalDate.selectedOperationalDate) return;
		// Initialize the timetable data for the selected date
		const timetableDataForSelectedDate: StopsDetailViewTimetableData[] = [];
		// Loop through each valid pattern, and each trip of the pattern
		for (const patternData of validPatternsData) {
			for (const tripData of patternData.trips) {
				// Skip if this trip is not valid for the selected operational date
				if (!tripData.valid_on.includes(operationalDate.selectedOperationalDate)) continue;
				// Loop through each stop time of the trip
				for (const stopTime of tripData.schedule) {
					// Skip if this stop time is not for the selected stop
					if (String(stopTime.stop_id) !== String(stopId)) continue;
					// Set a unique and stable ID for this arrival data
					const uniqueIdValueForArrivalData = `${operationalDate.selectedOperationalDate}-${patternData.version_id}-${tripData.version_id}-${stopTime.stop_id}-${stopTime.stop_sequence}-${stopTime.arrival_time}`;
					// Convert GTFS time string to Unix Timestamp
					const scheduledArrivalMs = convertGTFSTimeStringAndOperationalDateToUnixTimestamp(stopTime.arrival_time, operationalDate.selectedOperationalDate);
					// Fetch the trip update for this stop time
					const tripUpdate = tripUpdatesContext.actions.getTripUpdateForStop(tripData.trip_ids, stopTime.stop_id, stopTime.stop_sequence);
					// Extract the arrival time, delay and effective arrival time
					// from the trip update, if any was found
					const estimatedArrivalMs = tripUpdate?.arrival_time;
					const arrivalDelayMs = tripUpdate?.delay * 1000;
					const effectiveArrivalMs = estimatedArrivalMs || scheduledArrivalMs;
					// Detect the position of this stop time in the pattern
					const isFirstStop = stopTime.stop_sequence === patternData.path[0].stop_sequence;
					const isLastStop = stopTime.stop_sequence === patternData.path[patternData.path.length - 1].stop_sequence;
					// Detect the temporal status of this stop time
					const isPast = effectiveArrivalMs < Dates.now('Europe/Lisbon').unix_timestamp;
					const isRealtime = !!estimatedArrivalMs && operationalDate.isTodaySelected;
					// Add this stop time to the timetable array
					timetableDataForSelectedDate.push({
						_id: uniqueIdValueForArrivalData,
						agency_id: patternData.agency_id,
						arrival_delay_ms: arrivalDelayMs,
						arrival_effective_ms: effectiveArrivalMs,
						arrival_estimated_ms: estimatedArrivalMs,
						arrival_scheduled_ms: scheduledArrivalMs,
						color: patternData.color,
						headsign: patternData.headsign,
						is_first_stop: isFirstStop,
						is_last_stop: isLastStop,
						is_past: isPast,
						is_realtime: isRealtime,
						line_id: patternData.line_id,
						pattern_id: patternData._id,
						shape_id: patternData.shape_id,
						short_name: patternData.short_name,
						stop_sequence: stopTime.stop_sequence,
						text_color: patternData.text_color,
						trip_ids: tripData.trip_ids,
						tts_headsign: patternData.tts_headsign,
					});
				}
			}
		}
		// Return the timetable data, sorted by scheduled arrival time
		return timetableDataForSelectedDate.sort((a, b) => a.arrival_effective_ms - b.arrival_effective_ms);
	}, [validPatternsData, operationalDate.selectedOperationalDate, operationalDate.isTodaySelected, stopId, tripUpdatesContext.actions]);

	//
	// D. Handle actions

	const setActiveTripId = (tripId: string, stopSequence: number) => {
		const activePattern = validPatternsData?.find(patternGroup => patternGroup.trips.find(trip => trip.trip_ids.includes(tripId)));
		if (activePattern) setHighlightedPattern(activePattern);
		setHighlightedTripId(tripId);
		setHighlightedStopSequence(stopSequence);
	};

	const resetActiveTripId = () => {
		setHighlightedPattern(undefined);
		setHighlightedTripId(undefined);
		setHighlightedStopSequence(undefined);
	};

	//
	// E. Define context value

	const contextValue: StopsDetailContextState = {
		actions: {
			resetActiveTripId,
			setActiveTripId,
		},
		data: {
			associated_lines: associatedLinesData,
			highlighted_pattern: highlightedPattern,
			highlighted_stop_sequence: highlightedStopSequence,
			highlighted_trip_id: highlightedTripId,
			stop: selectedStopData,
			timetable: timetableDataForSelectedDate,
		},
		flags: {
			is_loading: isLoading || stopsContext.flags.isLoading || linesContext.flags.isLoading,
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
