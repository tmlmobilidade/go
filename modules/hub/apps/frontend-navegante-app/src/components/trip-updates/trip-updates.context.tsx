'use client';

/* * */

import { API_ROUTES } from '@tmlmobilidade/consts';
import { HubGtfsRtFeedMessage, HubGtfsRtStopTimeUpdate, type HubGtfsRtTripUpdate } from '@tmlmobilidade/types';
import { pushArrayToMap } from '@tmlmobilidade/utils';
import { createContext, type PropsWithChildren, useContext, useMemo } from 'react';
import useSWR from 'swr';

/* * */

type TripUpdateByStop = Map<string, HubGtfsRtTripUpdate[]>;
type TripUpdateByTrip = Map<string, HubGtfsRtTripUpdate[]>;

interface TripUpdatesContextState {
	actions: {
		getStopTimeUpdateByTripsInStop: (tripIds: string[], stopIds: string[]) => HubGtfsRtStopTimeUpdate | undefined
		getTripUpdatesByStop: (stopId: string) => HubGtfsRtTripUpdate[]
		getTripUpdatesByTrip: (tripId: string) => HubGtfsRtTripUpdate[]
	}
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

const TripUpdatesContext = createContext<TripUpdatesContextState | undefined>(undefined);

export function useTripUpdatesContext() {
	const context = useContext(TripUpdatesContext);
	if (!context) {
		throw new Error('useTripUpdatesContext must be used within a TripUpdatesContextProvider');
	}
	return context;
}

/* * */

export function TripUpdatesContextProvider({ children }: PropsWithChildren) {
	//

	//
	// A. Setup variables

	const { data, error, isLoading } = useSWR<HubGtfsRtFeedMessage, Error>({ credentials: 'omit', url: API_ROUTES.hub.REALTIME_TRIP_UPDATES }, { refreshInterval: 20_000 }); // 2 seconds

	console.log('data:', data);

	//
	// B. Transform data

	const { tripUpdatesByStop, tripUpdatesByTrip } = useMemo(() => {
		//

		// Initialize the maps
		const tripUpdatesByStop = new Map<string, HubGtfsRtTripUpdate[]>();
		const tripUpdatesByTrip = new Map<string, HubGtfsRtTripUpdate[]>();

		// If there is no data, return the empty maps
		if (!data?.entity?.length) return { tripUpdatesByStop, tripUpdatesByTrip };

		// Iterate over the entities
		for (const entity of data.entity) {
			// Get the trip update
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
	const getTripUpdatesByStop = (stopId: string): HubGtfsRtTripUpdate[] => tripUpdatesByStop.get(stopId) || [];
	const getTripUpdatesByTrip = (tripId: string): HubGtfsRtTripUpdate[] => tripUpdatesByTrip.get(tripId) || [];

	const getStopTimeUpdateByTripsInStop = (tripIds: string[], stopIds: string[]): HubGtfsRtStopTimeUpdate | undefined => {
		for (const tripId of tripIds) {
			const tripUpdates = getTripUpdatesByTrip(tripId);
			const matchingTripUpdate = tripUpdates.find(tripUpdate =>
				tripUpdate.stop_time_update?.some(stopUpdate => stopIds.includes(String(stopUpdate.stop_id))),
			);
			const stopTimeUpdate = matchingTripUpdate?.stop_time_update
				? matchingTripUpdate.stop_time_update.find(stopUpdate => stopIds.includes(String(stopUpdate.stop_id)))
				: undefined;
			if (stopTimeUpdate) {
				return stopTimeUpdate;
			}
		}
		return undefined;
	};

	//
	// D. Define context value

	const contextValue: TripUpdatesContextState = useMemo(() => {
		return {
			actions: {
				getStopTimeUpdateByTripsInStop,
				getTripUpdatesByStop,
				getTripUpdatesByTrip,
			},
			data: {
				trip_update_by_stop: tripUpdatesByStop,
				trip_update_by_trip: tripUpdatesByTrip,
				trip_update_raw: data?.entity ?? [],
			},
			flags: {
				error,
				loading: isLoading,
			},
		};
	}, [data, error, isLoading, tripUpdatesByStop, tripUpdatesByTrip]);

	//
	// E. Render components

	return (
		<TripUpdatesContext.Provider value={contextValue}>
			{children}
		</TripUpdatesContext.Provider>
	);

	//
};
