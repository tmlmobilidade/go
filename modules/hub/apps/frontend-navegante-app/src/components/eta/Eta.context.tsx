'use client';

/* * */
import { API_ROUTES } from '@tmlmobilidade/consts';
import { type UnixTimestamp } from '@tmlmobilidade/go-types-shared';
import { pushArrayToMap } from '@tmlmobilidade/utils';
import { createContext, PropsWithChildren, useContext, useEffect, useMemo } from 'react';
import useSWR from 'swr';

/* * */

export interface PreparedTripUpdate {
	eta_at: string
	eta_seconds: UnixTimestamp
	stop_id: string
	stop_name: string
	stop_sequence: string
	trip_id: string
	vehicle_id: string
}

interface EtaContextState {
	actions: {
		getEtasByStop: (stopId: string) => PreparedTripUpdate[]
		getEtasByTrip: (tripId: string) => PreparedTripUpdate[]
	}
	data: {
		all: PreparedTripUpdate[]
	}
	flags: {
		error: Error | undefined
		loading: boolean
	}
}

/* * */

const EtaContext = createContext<EtaContextState | undefined>(undefined);

export function useEtaContext() {
	const context = useContext(EtaContext);
	if (!context) {
		throw new Error('useEtaContext must be used within a EtaContextProvider');
	}
	return context;
}

/* * */

const byStopMap = new Map<string, PreparedTripUpdate[]>();
const byTripMap = new Map<string, PreparedTripUpdate[]>();

export const EtaContextProvider = ({ children }: PropsWithChildren) => {
	//

	//
	// A. Setup variables
	const { data: etaData, error: etaDataError, isLoading: etaDataLoading } = useSWR<PreparedTripUpdate[], Error>({ credentials: 'omit', url: API_ROUTES.hub.REALTIME_ETA }, { refreshInterval: 5_000 }); // 5 seconds

	//
	// B. Transform data
	useEffect(() => {
		byStopMap.clear();
		byTripMap.clear();
		if (!etaData?.length) return;
		for (const item of etaData) {
			pushArrayToMap(byStopMap, item.stop_id, item);
			pushArrayToMap(byTripMap, item.trip_id, item);
		}
	}, [etaData]);

	//
	// D. Define context value

	const contextValue: EtaContextState = useMemo(() => {
		return {
			actions: {
				getEtasByStop: (stopId: string) => byStopMap.get(stopId) ?? [],
				getEtasByTrip: (tripId: string) => byTripMap.get(tripId) ?? [],
			},
			data: {
				all: etaData ?? [],
			},
			flags: {
				error: etaDataError,
				loading: etaDataLoading,
			},
		};
	}, [etaData, etaDataError, etaDataLoading]);

	//
	// E. Render components

	return (
		<EtaContext.Provider value={contextValue}>
			{children}
		</EtaContext.Provider>
	);

	//
};
