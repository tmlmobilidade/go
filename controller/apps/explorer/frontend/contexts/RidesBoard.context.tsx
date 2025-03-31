'use client';

/* * */

import { ExtendedRideDisplay, useRidesContext } from '@/contexts/Rides.context';
import { DateTime } from 'luxon';
import { createContext, type PropsWithChildren, useContext, useEffect, useMemo, useRef, useState } from 'react';

/* * */

interface BoardSlot {
	_id: string
	index: number
	ride: ExtendedRideDisplay | null
}

/* * */

interface RidesBoardContextState {
	data: {
		slots: BoardSlot[]
	}
}

/* * */

const RidesBoardContext = createContext<RidesBoardContextState | undefined>(undefined);

export function useRidesBoardContext() {
	const context = useContext(RidesBoardContext);
	if (!context) {
		throw new Error('useRidesBoardContext must be used within a RidesBoardContextProvider');
	}
	return context;
}

/* * */

export const RidesBoardContextProvider = ({ children }: PropsWithChildren) => {
	//

	//
	// A. Setup variables

	const UPDATE_DELAY = 1000;

	const ridesContext = useRidesContext();

	const isUpdating = useRef(false);

	const slotsCountRef = useRef(0);
	const [dataSlotsState, setDataSlotsState] = useState<RidesBoardContextState['data']['slots']>([]);

	//
	// B. Transform data

	const updateSlotsCount = () => {
		// Return if no window object
		if (typeof window === 'undefined') return;
		// Measure the height of the viewport
		const rowHeight = 60;
		const usableHeight = window.innerHeight - 50;
		slotsCountRef.current = Math.floor(usableHeight / rowHeight);
		// Update slots state
		setDataSlotsState((prev) => {
			// Skip if no change in slots count detected
			if (slotsCountRef.current === prev.length) return prev;
			// Calculate the expected slots count
			const expectedSlotsCount = slotsCountRef.current - prev.length;
			const newSlotsCount = expectedSlotsCount < 0 ? 0 : expectedSlotsCount;
			// Create empty slots
			const emptySlots = Array(newSlotsCount)
				.fill(null)
				.map((_, index) => ({ _id: `slot-${index}`, index, ride: null }));
			// Concatenate new slots with existing slots
			return [...prev, ...emptySlots]
				.slice(0, slotsCountRef.current)
				.map((slot, index) => ({ ...slot, _id: `slot-${index}`, index }));
		});
	};

	const refreshList = async () => {
		// Skip if no slots available
		if (!slotsCountRef.current) return;
		// Skip if already updating
		if (isUpdating.current) return;
		// Set updating flag
		isUpdating.current = true;
		// Filter rides that are in the future
		// and sort them by start time
		const filteredRidesData: ExtendedRideDisplay[] = Array
			.from(ridesContext.data.rides.values())
			.filter(ride => ride.start_time_scheduled > DateTime.now().minus({ minutes: 10 }).toMillis())
			// .filter(ride => ride.operational_status === 'running')
			.sort((a, b) => a.start_time_scheduled - b.start_time_scheduled)
			.slice(0, slotsCountRef.current);
		// Update slots with filtered rides
		for (const [index] of dataSlotsState.entries()) {
			setDataSlotsState((prev) => {
				const slots = [...prev];
				slots[index] = { ...slots[index], ride: filteredRidesData[index] || null };
				return slots;
			});
			// Await for 200 milliseconds before updating the next slot
			if (filteredRidesData[index]) {
				await new Promise(resolve => setTimeout(resolve, UPDATE_DELAY));
			}
		}
		// Unset flag
		isUpdating.current = false;
	};

	//
	// C. Handle actions

	useEffect(() => {
		updateSlotsCount();
		const interval = setInterval(updateSlotsCount, 1000);
		return () => clearInterval(interval);
	}, []);

	useEffect(() => {
		refreshList();
		const interval = setInterval(refreshList, 1000);
		return () => clearInterval(interval);
	}, [ridesContext.data.rides, slotsCountRef.current]);

	//
	// C. Define context value

	const contextValue: RidesBoardContextState = useMemo(() => ({
		data: {
			slots: dataSlotsState,
		},
	}), [dataSlotsState]);

	//
	// D. Render components

	return (
		<RidesBoardContext.Provider value={contextValue}>
			{children}
		</RidesBoardContext.Provider>
	);

	//
};
