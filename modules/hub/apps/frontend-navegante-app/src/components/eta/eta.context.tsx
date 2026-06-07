'use client';

/* * */

import { API_ROUTES } from '@tmlmobilidade/consts';
import { HubGtfsRtFeedMessage, type HubGtfsRtTripUpdate } from '@tmlmobilidade/types';
import { pushArrayToMap } from '@tmlmobilidade/utils';
import { createContext, PropsWithChildren, useContext, useMemo } from 'react';
import useSWR from 'swr';

/* * */

type TripUpdateByStop = Map<string, HubGtfsRtTripUpdate[]>;
type TripUpdateByTrip = Map<string, HubGtfsRtTripUpdate[]>;

interface EtaContextState {
	data: {
		trip_update_by_stop: TripUpdateByStop
		trip_update_by_trip: TripUpdateByTrip
		trip_update_raw: HubGtfsRtTripUpdate[]
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

export const EtaContextProvider = ({ children }: PropsWithChildren) => {
	//

	//
	// A. Setup variables
	const { data, error, isLoading } = useSWR<HubGtfsRtFeedMessage, Error>(API_ROUTES.hub.REALTIME_ETA_GTFS);

	//
	// B. Transform data
	const { tripUpdatesByStop, tripUpdatesByTrip } = useMemo(() => {
		if (!data?.entity?.length) return { tripUpdatesByStop: new Map(), tripUpdatesByTrip: new Map() };

		for (const entity of data.entity) {
		//
			const tripUpdate = entity.trip_update;
			if (!tripUpdate?.stop_time_update?.length) continue;

			//
			// If the trip update does not have stop_time_update, skip it
			const tripId = tripUpdate.trip?.trip_id;

			//
			// If the trip update has trip, add the trip update to the trip updates by trip
			if (tripId) {
				pushArrayToMap(tripUpdatesByTrip, tripId, tripUpdate);
			}

			//
			// Add the trip update to the trip updates by stop
			for (const stopUpdate of tripUpdate.stop_time_update) {
				pushArrayToMap(tripUpdatesByStop, stopUpdate.stop_id, tripUpdate);
			}
		}
		return { tripUpdatesByStop, tripUpdatesByTrip };
	}, [data]);

	//
	// C. Handle actions

	//
	// D. Define context value

	const contextValue: EtaContextState = useMemo(() => {
		return {
			data: {
				trip_update_by_stop: tripUpdatesByStop,
				trip_update_by_trip: tripUpdatesByTrip,
				trip_update_raw: data.entity,
			},
			flags: {
				error,
				loading: isLoading,
			},
		};
	}, [data.entity, error, isLoading, tripUpdatesByStop, tripUpdatesByTrip]);

	//
	// E. Render components

	return (
		<EtaContext.Provider value={contextValue}>
			{children}
		</EtaContext.Provider>
	);

	//
};
