'use client';

/* * */

import { useLinesContext } from '@/contexts/Lines.context';
import { useStopsContext } from '@/contexts/Stops.context';
import { Line, Stop } from '@carrismetropolitana/api-types/network';
import { Ride } from '@tmlmobilidade/types';
import { useDebouncedValue } from '@tmlmobilidade/ui';
import { swrFetcher } from '@tmlmobilidade/utils';
import { useQueryState } from 'nuqs';
import { createContext, PropsWithChildren, useContext, useEffect, useMemo, useRef, useState } from 'react';
import useSWR from 'swr';

/* * */

export type RidesData = Ride & { stop_ids: string[] };

interface RidesContextState {
	actions: {
		clearFilters: () => void
		removeAllRides: () => void
		setFilterLineId: (value: string) => void
		setFilterSearch: (value: string) => void
		setFilterStopId: (value: string) => void
		setSelectedRidesIds: (value: string[]) => void
	}
	data: {
		filteredLines: Line[]
		filteredStops: Stop[]
		rides: RidesData[]
		selectedRidesIds: string[]
	}
	filters: {
		lineId: null | string
		search: string
		stopId: null | string
	}
	flags: {
		error: Error | undefined
		isFiltering: boolean
		isLoading: boolean
	}
}

/* * */

const RidesContext = createContext<RidesContextState | undefined>(undefined);

export const useRidesContext = () => {
	const context = useContext(RidesContext);
	if (!context) {
		throw new Error('useRidesContext must be used within an RidesContextProvider');
	}
	return context;
};

/* * */

export function RidesContextProvider({ children }: PropsWithChildren) {
	//

	//
	// A. Setup variables
	const [filterSearch, setFilterSearch] = useQueryState('rideSearch', { defaultValue: '' });
	const [debouncedFilterSearch] = useDebouncedValue(filterSearch.trim(), 500);

	const [filterLineId, setFilterLineId] = useQueryState('rideLineId', { defaultValue: '' });
	const [filterStopId, setFilterStopId] = useQueryState('rideStopId', { defaultValue: '' });

	const [filteredLines, setFilteredLines] = useState<Line[]>([]);
	const [filteredStops, setFilteredStops] = useState<Stop[]>([]);
	const [isFiltering, setIsFiltering] = useState(false);

	const [selectedRidesIds, setSelectedRidesIds] = useState<string[]>([]);

	const workerRef = useRef<null | Worker>(null);

	const linesContext = useLinesContext();
	const stopsContext = useStopsContext();

	//
	// B. Fetch data
	const { data: ridesData, error: ridesError, isLoading: ridesLoading } = useSWR<RidesData[], Error>(`/api/rides?search=${debouncedFilterSearch}&lineId=${filterLineId}&stopId=${filterStopId}`, swrFetcher);

	//
	// C. Transform Data

	useEffect(() => {
		//

		if (!ridesData) {
			setFilteredLines(linesContext.data.lines);
			setFilteredStops(stopsContext.data.stops);
			return;
		}

		//
		// Setup a new worker instance to process the GTFS file.

		if (workerRef.current) {
			workerRef.current.terminate();
		}

		setIsFiltering(true);

		workerRef.current = new Worker(new URL('@/workers/rides-filter.worker.ts', import.meta.url));
		workerRef.current.postMessage({ availableLines: linesContext.data.lines, availableStops: stopsContext.data.stops, ridesData });
		workerRef.current.onmessage = (event) => {
			const { lines, stops } = event.data;
			setFilteredLines(lines);
			setFilteredStops(stops);

			setIsFiltering(false);
		};

		//
	}, [ridesData, linesContext.data.lines, stopsContext.data.stops]);

	//
	// D. Define actions

	const clearFilters = () => {
		setFilterLineId('');
		setFilterSearch('');
		setFilterStopId('');
	};

	const addAllRides = () => {
		setSelectedRidesIds(ridesData?.map(ride => ride._id) ?? []);
	};

	const removeAllRides = () => {
		setSelectedRidesIds([]);
	};

	//
	// E. Define context value

	const contextValue: RidesContextState = useMemo(() => ({
		actions: {
			addAllRides,
			clearFilters,
			removeAllRides,
			setFilterLineId,
			setFilterSearch,
			setFilterStopId,
			setSelectedRidesIds,
		},
		data: {
			filteredLines,
			filteredStops,
			rides: ridesData ?? [],
			selectedRidesIds,
		},
		filters: {
			lineId: filterLineId,
			search: filterSearch,
			stopId: filterStopId,
		},
		flags: {
			error: ridesError,
			isFiltering: ridesLoading,
			isLoading: ridesLoading,
		},
	}), [filterSearch, ridesData, ridesError, ridesLoading, filteredLines, filteredStops, isFiltering, selectedRidesIds]);

	//
	// F. Return context provider

	return (
		<RidesContext.Provider value={contextValue}>
			{children}
		</RidesContext.Provider>
	);

	//
};
