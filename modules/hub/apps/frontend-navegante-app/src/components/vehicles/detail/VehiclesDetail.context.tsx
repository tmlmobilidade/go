'use client';

import { useVehiclesData } from '@/components/vehicles/use-vehicles-data';
import { type HubV1ApiVehiclePosition } from '@tmlmobilidade/go-types-hub';
import { createContext, type PropsWithChildren, useContext, useEffect, useMemo, useState } from 'react';

/* * */

interface VehiclesDetailContextState {
	data: {
		vehicle: HubV1ApiVehiclePosition | null
	}
	flags: {
		has_error: boolean
		is_loading: boolean
		is_not_found: boolean
		is_stale: boolean
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

	const { data: vehicles, error, isLoading } = useVehiclesData();
	const [vehicleSnapshot, setVehicleSnapshot] = useState<HubV1ApiVehiclePosition | null>(null);

	//
	// B. Transform data

	const liveVehicle = useMemo(() => {
		return vehicles.find(vehicle => vehicle.vehicle_id === vehicleId) ?? null;
	}, [vehicleId, vehicles]);
	const vehicle = liveVehicle ?? (vehicleSnapshot?.vehicle_id === vehicleId ? vehicleSnapshot : null);

	//
	// C. Synchronize last known vehicle data

	useEffect(() => {
		if (liveVehicle) setVehicleSnapshot(liveVehicle);
		else setVehicleSnapshot(current => current?.vehicle_id === vehicleId ? current : null);
	}, [liveVehicle, vehicleId]);

	//
	// D. Define context value

	const contextValue = useMemo<VehiclesDetailContextState>(() => ({
		data: {
			vehicle,
		},
		flags: {
			has_error: Boolean(error && !vehicle),
			is_loading: isLoading && !vehicle,
			is_not_found: !isLoading && !error && !vehicle,
			is_stale: Boolean(vehicle && !liveVehicle),
		},
	}), [error, isLoading, liveVehicle, vehicle]);

	//
	// E. Render components

	return (
		<VehiclesDetailContext.Provider value={contextValue}>
			{children}
		</VehiclesDetailContext.Provider>
	);

	//
};
