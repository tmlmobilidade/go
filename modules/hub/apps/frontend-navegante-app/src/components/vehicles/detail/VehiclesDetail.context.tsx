'use client';

import { useVehiclesContext } from '@/components/vehicles/Vehicles.context';
import { type SimplifiedVehicleEvent } from '@tmlmobilidade/types';
import { createContext, type PropsWithChildren, useContext, useMemo } from 'react';

/* * */

interface VehiclesDetailContextState {
	data: {
		vehicle: null | SimplifiedVehicleEvent
	}
}

/* * */

const VehiclesDetailContext = createContext<undefined | VehiclesDetailContextState>(undefined);

export function useVehiclesDetailContext() {
	const context = useContext(VehiclesDetailContext);
	if (!context) {
		throw new Error('useVehiclesDetailContext must be used within a VehiclesDetailContextProvider');
	}
	return context;
}

/* * */

export const VehiclesDetailContextProvider = ({ children, vehicleId }: PropsWithChildren<{ vehicleId: string }>) => {
	//

	//
	// A. Setup variables

	const vehiclesContext = useVehiclesContext();

	//
	// B. Transform data

	const vehicleData = useMemo(() => {
		return vehiclesContext.data.vehicles.find(vehicle => vehicle.vehicle_id === vehicleId);
	}, [vehicleId, vehiclesContext.data.vehicles]);

	//
	// E. Define context value

	const contextValue: VehiclesDetailContextState = {
		data: {
			vehicle: vehicleData,
		},
	};

	//
	// F. Render components

	return (
		<VehiclesDetailContext.Provider value={contextValue}>
			{children}
		</VehiclesDetailContext.Provider>
	);

	//
};
