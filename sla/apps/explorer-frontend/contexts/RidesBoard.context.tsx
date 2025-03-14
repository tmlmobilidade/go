'use client';

/* * */

import { ExtendedRideDisplay, useRidesContext } from '@/contexts/Rides.context';
import { DateTime } from 'luxon';
import { createContext, type PropsWithChildren, type RefObject, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { type ViewportListRef } from 'react-viewport-list';

/* * */

interface RidesBoardContextState {
	data: {
		board_ref: RefObject<ViewportListRef>
		rides: ExtendedRideDisplay[]
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

	const dataBoardRef = useRef<null | ViewportListRef>(null);
	const [dataRidesDisplayState, setDataRidesDisplayState] = useState<ExtendedRideDisplay[]>([]);

	//
	// B. Transform data

	useEffect(() => {
		const refreshList = () => {
			const allRidesDisplay: ExtendedRideDisplay[] = Array
				.from(ridesContext.data.rides.values())
				.filter((ride) => {
					const startTime = ride.start_time_observed || ride.start_time_scheduled;
					const startTimeIsInFuture = startTime > DateTime.now().toMillis();
					const hasStartTimeObserved = ride.start_time_observed;
					return startTimeIsInFuture;
				})
				.sort((a, b) => {
					const timeA = a.start_time_observed || a.start_time_scheduled;
					const timeB = b.start_time_observed || b.start_time_scheduled;
					return timeA - timeB;
				});
			setDataRidesDisplayState(allRidesDisplay);
		};
		const interval = setInterval(refreshList, 1000);
		return () => clearInterval(interval);
	}, [ridesContext.data.rides]);

	//
	// C. Define context value

	const contextValue: RidesBoardContextState = useMemo(() => ({
		data: {
			board_ref: dataBoardRef,
			rides: dataRidesDisplayState,
		},
	}), [dataRidesDisplayState]);

	//
	// D. Render components

	return (
		<RidesBoardContext.Provider value={contextValue}>
			{children}
		</RidesBoardContext.Provider>
	);

	//
};
