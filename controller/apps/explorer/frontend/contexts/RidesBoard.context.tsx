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
	actions: {
		handleSetSlotsCount: (count: number) => void
	}
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

	const ridesContext = useRidesContext();

	const UPDATE_DELAY = 1500;

	const isUpdating = useRef(false);

	const [dataSlotsCountState, setDataSlotsCountState] = useState<number>(2);
	const [dataSlotsState, setDataSlotsState] = useState<RidesBoardContextState['data']['slots']>([]);

	//
	// B. Transform data

	useEffect(() => {
		const refreshList = async () => {
			if (isUpdating.current) return;
			// console.log('ridesContext.data.rides.size', ridesContext.data.rides.size);
			// if (ridesContext.data.rides.size < 18000) return;
			isUpdating.current = true;
			const filteredRidesData: ExtendedRideDisplay[] = Array
				.from(ridesContext.data.rides.values())
				.filter((ride) => {
					const startTime = ride.start_time_observed || ride.start_time_scheduled;
					const startTimeIsInFuture = startTime > DateTime.now().minus({ minutes: 30 }).toMillis();
					// const hasStartTimeObserved = ride.start_time_observed;
					return startTimeIsInFuture;
				})
				.sort((a, b) => {
					const timeA = a.start_time_observed || a.start_time_scheduled;
					const timeB = b.start_time_observed || b.start_time_scheduled;
					return timeA - timeB;
				})
				.slice(0, dataSlotsCountState);
			// console.log('here2', dataSlotsCountState, filteredRidesData);
			for (const [index, rideData] of filteredRidesData.entries()) {
				// console.log('here2', index, rideData._id);
				setDataSlotsState((prevSlots) => {
					const newSlots = [...prevSlots];
					newSlots[index] = { _id: `slot-${index}`, index: index, ride: rideData };
					return newSlots;
				});
				// console.log('Updated slot', index, rideData._id);
				// Await for 200 milliseconds before updating the next slot
				await new Promise(resolve => setTimeout(resolve, UPDATE_DELAY));
			}
			isUpdating.current = false;
			// await refreshList();
		};
		refreshList();
		const interval = setInterval(refreshList, 1000);
		return () => clearInterval(interval);
	}, [ridesContext.data.rides, dataSlotsCountState]);

	//
	// C. Handle actions

	const handleSetSlotsCount = (count: number) => {
		setDataSlotsCountState(count);
	};

	//
	// C. Define context value

	const contextValue: RidesBoardContextState = useMemo(() => ({
		actions: {
			handleSetSlotsCount,
		},
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
