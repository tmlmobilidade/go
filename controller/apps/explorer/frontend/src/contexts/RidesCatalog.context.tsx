'use client';

/* * */

import { useRidesContext } from '@/contexts/Rides.context';
import { getDelayStatus } from '@/utils/get-delay-status';
import { getOperationalStatus } from '@/utils/get-operational-status';
import { getSeenStatus } from '@/utils/get-seen-status';
import { getStartTime } from '@/utils/get-start-time';
import { nprogress } from '@mantine/nprogress';
import { type Ride, type RideAnalysis } from '@tmlmobilidade/types';
import { DateTime } from 'luxon';
import { createContext, type PropsWithChildren, type RefObject, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { ViewportListRef } from 'react-viewport-list';

/* * */

const DEFAULT_SCROLL_OFFSET = -250;

/* * */

export interface ExtendedRideDisplay extends Ride {
	delay_status: 'delayed' | 'early' | 'ontime' | null
	operational_status: 'ended' | 'missed' | 'running' | 'scheduled'
	seen_status: 'gone' | 'seen' | 'unseen'
	simple_three_vehicle_events_grade: RideAnalysis['grade']
	start_time_observed_display: null | string
	start_time_scheduled_display: string
}

interface RidesCatalogContextState {
	actions: {
		setLockStatus: (offset?: number) => void
		updateLockIndex: () => void
	}
	data: {
		is_locked: boolean
		is_user_scrolling: boolean
		list_ref: RefObject<ViewportListRef>
		lock_index: number
		lock_offset: number
		rides_display: ExtendedRideDisplay[]
	}
	flags: {
		is_loading: boolean
	}
}

/* * */

const RidesCatalogContext = createContext<RidesCatalogContextState | undefined>(undefined);

export function useRidesCatalogContext() {
	const context = useContext(RidesCatalogContext);
	if (!context) {
		throw new Error('useRidesCatalogContext must be used within a RidesCatalogContextProvider');
	}
	return context;
}

/* * */

export const RidesCatalogContextProvider = ({ children }: PropsWithChildren) => {
	//

	//
	// A. Setup variables

	const ridesContext = useRidesContext();

	const dataCatalogRef = useRef<null | ViewportListRef>(null);
	const [dataLockIndexState, setDataLockIndexState] = useState<number>(0);
	const [dataLockOffsetState, setDataLockOffsetState] = useState<number>(DEFAULT_SCROLL_OFFSET);
	const [dataIsLockedState, setDataIsLockedState] = useState<boolean>(true);
	const [dataIsUserScrollingState, setDataIsUserScrollingState] = useState<boolean>(false);

	const [dataRidesDisplayState, setDataRidesDisplayState] = useState<ExtendedRideDisplay[]>([]);

	const scrollTimeout = useRef(null);

	//
	// B. Transform data

	useEffect(() => {
		const refreshCatalog = () => {
			const allRidesDisplay: ExtendedRideDisplay[] = Array
				.from(ridesContext.data.rides.values())
				// .filter(rideData => rideData.pattern_id === '4720_0_1')
				.sort((a, b) => String(a.start_time_scheduled).localeCompare(String(b.start_time_scheduled)))
				.map(rideData => ({
					...rideData,
					delay_status: getDelayStatus(rideData.start_time_scheduled, rideData.start_time_observed),
					operational_status: getOperationalStatus(rideData.start_time_scheduled, rideData.seen_last_at),
					seen_status: getSeenStatus(rideData.seen_last_at),
					simple_three_vehicle_events_grade: rideData.analysis.find(analysis => analysis._id === 'SIMPLE_THREE_VEHICLE_EVENTS')?.grade || null,
					start_time_observed_display: rideData.start_time_observed ? getStartTime(rideData.start_time_observed) : null,
					start_time_scheduled_display: getStartTime(rideData.start_time_scheduled),
				}));
			setDataRidesDisplayState(allRidesDisplay);
		};
		const interval = setInterval(refreshCatalog, 1000);
		return () => clearInterval(interval);
	}, [ridesContext.data.rides]);

	//
	// B. Handle actions

	useEffect(() => {
		if (ridesContext.data.rides.size !== ridesContext.data.expected_items) {
			const currentProgress = ridesContext.data.rides.size / ridesContext.data.expected_items * 100;
			nprogress.set(currentProgress);
		}
		else {
			nprogress.complete();
		}
	}, [ridesContext.data.rides.size, ridesContext.data.expected_items]);

	useEffect(() => {
		const nowMillis = DateTime.now().toMillis();
		for (const [rideIndex, rideData] of dataRidesDisplayState.entries()) {
			if (nowMillis - rideData.start_time_scheduled <= 0) {
				setDataLockIndexState(rideIndex);
				return;
			}
		}
	}, [dataRidesDisplayState]);

	useEffect(() => {
		const interval = setInterval(() => {
			// Check if the clock is locked and the user is not scrolling
			if (dataCatalogRef.current && dataIsLockedState && !dataIsUserScrollingState) {
				dataCatalogRef.current.scrollToIndex({
					index: dataLockIndexState,
					offset: dataLockOffsetState,
				});
			}
		}, 10);
		return () => clearInterval(interval);
	}, [dataIsLockedState, dataIsUserScrollingState, dataLockIndexState, dataLockOffsetState]);

	useEffect(() => {
		if (typeof window === 'undefined' || !dataIsLockedState) return;
		const handleUserScroll = () => {
			// Set the flag if the user is scrolling
			setDataIsUserScrollingState(true);
			// Clear the timeout if the user is still scrolling
			if (scrollTimeout.current)clearTimeout(scrollTimeout.current);
			// Set a timeout to clear the flag if the user stops scrolling
			scrollTimeout.current = setTimeout(() => setDataIsUserScrollingState(false), 100);
		};
		window.addEventListener('wheel', handleUserScroll, { passive: true });
		window.addEventListener('touchmove', handleUserScroll, { passive: true });
		return () => {
			window.removeEventListener('wheel', handleUserScroll);
			window.removeEventListener('touchmove', handleUserScroll);
		};
	}, [dataIsLockedState]);

	useEffect(() => {
		if (typeof window === 'undefined' || !dataIsLockedState) return;
		// Save the initial scroll position
		const initialScrollY = window.scrollY;
		const handleScroll = () => {
			// Check if the scroll was triggered by the user
			if (!dataIsUserScrollingState) return;
			// Check if the user scrolled more than 150px
			const scrolledDistance = Math.abs(window.scrollY - initialScrollY);
			if (scrolledDistance > 300) {
				setDataIsLockedState(false);
			}
		};
		window.addEventListener('scroll', handleScroll);
		return () => {
			window.removeEventListener('scroll', handleScroll);
		};
	}, [dataIsLockedState, dataIsUserScrollingState]);

	const setLockStatus = (offset?: number) => {
		setDataLockOffsetState(offset || DEFAULT_SCROLL_OFFSET);
		setDataIsLockedState(prev => !prev);
	};

	const updateLockIndex = () => {
		setDataLockIndexState(prev => prev + 1);
	};

	//
	// C. Define context value

	const contextValue: RidesCatalogContextState = useMemo(() => ({
		actions: {
			setLockStatus,
			updateLockIndex,
		},
		data: {
			is_locked: dataIsLockedState,
			is_user_scrolling: dataIsUserScrollingState,
			list_ref: dataCatalogRef,
			lock_index: dataLockIndexState,
			lock_offset: dataLockOffsetState,
			rides_display: dataRidesDisplayState,
		},
		flags: {
			is_loading: ridesContext.data.rides.size !== ridesContext.data.expected_items,
		},
	}), [dataCatalogRef.current, dataRidesDisplayState, dataLockIndexState, dataLockOffsetState, dataIsLockedState, ridesContext.data.rides.size, ridesContext.data.expected_items, dataIsUserScrollingState]);

	//
	// D. Render components

	return (
		<RidesCatalogContext.Provider value={contextValue}>
			{children}
		</RidesCatalogContext.Provider>
	);

	//
};
