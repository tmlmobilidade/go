'use client';

/* * */

import { useRidesContext } from '@/contexts/Rides.context';
import { Ride, VehicleEvent } from '@tmlmobilidade/core/types';
import { DateTime } from 'luxon';
import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import useSWR from 'swr';

/* * */

interface RidesDetailContextState {
	data: {
		active_ride_id: Ride['_id'] | undefined
		vehicle_events: VehicleEvent[]
	}
}

/* * */

const RidesDetailContext = createContext<RidesDetailContextState | undefined>(undefined);

export function useRidesDetailContext() {
	const context = useContext(RidesDetailContext);
	if (!context) {
		throw new Error('useRidesDetailContext must be used within a RidesDetailContextProvider');
	}
	return context;
}

/* * */

export const RidesDetailContextProvider = ({ children, rideId }) => {
	//

	//
	// A. Setup variables

	// const [dataVehicleEventsState, setDataVehicleEventsState] = useState<RidesDetailContextState['data']['vehicle_events']>([]);

	//
	// B. Fetch data

	const { data: vehicleEventsData } = useSWR<VehicleEvent[]>(`http://localhost:5050/vehicle-events/${rideId}`, { refreshInterval: 1000 });

	console.log('vehicleEventsData', rideId, vehicleEventsData);

	//
	// C. Define context value

	const contextValue: RidesDetailContextState = useMemo(() => ({
		data: {
			active_ride_id: rideId,
			vehicle_events: vehicleEventsData || [],
		},
	}), [rideId, vehicleEventsData]);

	//
	// D. Render components

	return (
		<RidesDetailContext.Provider value={contextValue}>
			{children}
		</RidesDetailContext.Provider>
	);

	//
};
