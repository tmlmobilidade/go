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

	const UPDATE_DELAY = 1500;

	const ridesContext = useRidesContext();

	const isUpdating = useRef(false);

	const slotsCountRef = useRef(0);

	const currentSlotIndex = useRef(0);
	const currentQueueIndex = useRef(0);

	const queue = useRef<ExtendedRideDisplay[]>([]);

	const [dataSlotsState, setDataSlotsState] = useState<RidesBoardContextState['data']['slots']>([]);

	//
	// B. Transform data

	const updateSlotsCount = () => {
		// Return if no window object
		if (typeof window === 'undefined') return;
		// Measure the height of the viewport
		const rowHeight = 60;
		const usableHeight = window.innerHeight - rowHeight;
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

	const fillQueueWithNewRides = () => {
		// Get the IDs of rides already in the queue
		const queueRideIds = new Set(queue.current.map(ride => ride._id));
		// Filter rides to display
		const freshRidesData: ExtendedRideDisplay[] = Array
			.from(ridesContext.data.rides.values())
			.filter(ride => ride.start_time_scheduled < DateTime.now().toMillis())
			.filter(ride => ride.start_time_scheduled > DateTime.now().minus({ minutes: 2 }).toMillis())
			// .filter(ride => ride.operational_status === 'running')
			.filter(ride => !queueRideIds.has(ride._id))
			.sort((a, b) => a.start_time_scheduled - b.start_time_scheduled)
			.slice(0, 100);
		// Update queue state
		queue.current = Array
			.from([...queue.current, ...freshRidesData])
			.sort((a, b) => a.start_time_scheduled - b.start_time_scheduled);
	};

	const displayQueue = async () => {
		console.log('isUpdating.current', isUpdating.current);
		console.log('currentSlotIndex.current', currentSlotIndex.current);
		console.log('currentQueueIndex.current', currentQueueIndex.current);
		// Skip if already updating
		if (isUpdating.current) return;

		// Check if index is within bounds
		if (currentSlotIndex.current >= slotsCountRef.current) {
			currentSlotIndex.current = 0;
		}
		if (currentQueueIndex.current >= queue.current.length) {
			return;
		}
		console.log('after checks');
		// Set updating flag
		isUpdating.current = true;
		// Update slots with rides
		setDataSlotsState((prev) => {
			const slots = [...prev];
			slots[currentSlotIndex.current] = { ...slots[currentSlotIndex.current], ride: queue.current[currentQueueIndex.current] || null };
			// Return the updated slots
			return slots;
		});
		// Increment the slot index
		currentSlotIndex.current++;
		// Increment the queue index
		currentQueueIndex.current++;
		// Await for 200 milliseconds before updating the next slot
		// await new Promise(resolve => setTimeout(resolve, UPDATE_DELAY));
		// Update slots with filtered rides
		// for (const [index] of dataSlotsState.entries()) {
		// 	setDataSlotsState((prev) => {
		// 		const slots = [...prev];
		// 		slots[index] = { ...slots[index], ride: filteredRidesData[index] || null };
		// 		return slots;
		// 	});
		// 	// Await for 200 milliseconds before updating the next slot
		// 	if (filteredRidesData[index]) {
		await new Promise(resolve => setTimeout(resolve, UPDATE_DELAY));
		// 	}
		// }
		// Unset flag
		isUpdating.current = false;
	};

	const refreshList = async () => {
		fillQueueWithNewRides();
		await displayQueue();
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
