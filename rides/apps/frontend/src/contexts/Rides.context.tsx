'use client';

/* * */

import { type RideNormalized } from '@/types/normalized';
import { getRideNormalized } from '@/utils/get-ride-normalized';
import { useDebouncedState } from '@mantine/hooks';
import { type Ride, UnixTimestamp } from '@tmlmobilidade/types';
import { Dates, HttpResponse, swrFetcher } from '@tmlmobilidade/utils';
import { createContext, type PropsWithChildren, useContext, useEffect, useMemo, useState } from 'react';
import useSWR from 'swr';

/* * */

interface RidesContextState {
	actions: {
		getRideById: (rideId: string) => RideNormalized | undefined
	}
	data: {
		normalized: Map<string, RideNormalized>
	}
	flags: {
		error: Error | null
		last_update: null | UnixTimestamp
		loading: boolean
	}
}

/* * */

const RidesContext = createContext<RidesContextState | undefined>(undefined);

export function useRidesContext() {
	const context = useContext(RidesContext);
	if (!context) {
		throw new Error('useRidesContext must be used within a RidesContextProvider');
	}
	return context;
}

/* * */

export const RidesContextProvider = ({ children }: PropsWithChildren) => {
	//

	//
	// A. Setup variables

	const [dataRidesNormalized, setDataRidesNormalized] = useState<Map<string, RideNormalized>>(new Map());
	const [flagsLastUpdateState, setFlagsLastUpdateState] = useDebouncedState<null | UnixTimestamp>(null, 100);

	//
	// B. Fetch data

	const { data: ridesBatchData, error: ridesBatchError, isLoading: ridesBatchLoading } = useSWR<HttpResponse<Ride[]>>('/api/rides', swrFetcher);

	//
	// C. Handle actions

	useEffect(() => {
		if (ridesBatchLoading || !ridesBatchData.data) return;
		const ridesMap = new Map<string, RideNormalized>();
		ridesBatchData.data.forEach((item) => {
			const normalized = getRideNormalized(item);
			ridesMap.set(normalized._id, normalized);
		});
		setDataRidesNormalized(ridesMap);
		setFlagsLastUpdateState(Dates.now('Europe/Lisbon').unix_timestamp);
	}, [ridesBatchData, ridesBatchLoading, setFlagsLastUpdateState]);

	const getRideById = (rideId: string): RideNormalized | undefined => {
		return dataRidesNormalized.get(rideId);
	};

	//
	// D. Define context value

	const contextValue: RidesContextState = useMemo(() => ({
		actions: {
			getRideById,
		},
		data: {
			normalized: dataRidesNormalized,
		},
		flags: {
			error: ridesBatchError || null,
			last_update: flagsLastUpdateState,
			loading: ridesBatchLoading,
		},
	}), [
		flagsLastUpdateState,
		dataRidesNormalized,
	]);

	//
	// E. Render components

	return (
		<RidesContext.Provider value={contextValue}>
			{children}
		</RidesContext.Provider>
	);

	//
};
