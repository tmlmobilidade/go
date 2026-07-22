'use client';

import { useSessionStorage } from '@mantine/hooks';
import { createContext, type PropsWithChildren, useCallback, useContext, useEffect, useMemo, useState } from 'react';

/* * */

export type UserLocationTrackingMode = 'follow' | 'follow-bearing' | 'idle';

export interface UserLocation {
	accuracy: null | number
	bearing: null | number
	latitude: number
	longitude: number
}

interface UserLocationContextState {
	availableUserLocationTrackingModes: UserLocationTrackingMode[]
	requestUserLocationPermission: () => void
	setUserLocationTrackingMode: (mode: UserLocationTrackingMode) => void
	userLocation: null | UserLocation
	userLocationTrackingMode: UserLocationTrackingMode
}

/* * */

const UserLocationContext = createContext<undefined | UserLocationContextState>(undefined);

export function useUserLocation(): UserLocationContextState {
	const context = useContext(UserLocationContext);
	if (!context) {
		throw new Error('useUserLocation must be used within a UserLocationContextProvider');
	}
	return context;
}

/* * */

export function UserLocationContextProvider({ children }: PropsWithChildren) {
	//

	//
	// A. Setup variables

	const [userLocation, setUserLocation] = useState<null | UserLocation>(null);
	const [userLocationError, setUserLocationError] = useState<null | string>(null);
	const [deviceOrientationError, setDeviceOrientationError] = useState<null | string>(null);
	const [userLocationTrackingMode, setUserLocationTrackingMode] = useSessionStorage<UserLocationTrackingMode>({
		defaultValue: 'follow',
		key: 'user-location-tracking-mode',
	});

	//
	// B. Transform data

	const availableUserLocationTrackingModes = useMemo(() => {
		const modes = new Set<UserLocationTrackingMode>(['follow', 'follow-bearing', 'idle']);
		if (userLocationError) modes.delete('follow');
		if (userLocationError || deviceOrientationError) modes.delete('follow-bearing');
		return Array.from(modes);
	}, [deviceOrientationError, userLocationError]);

	//
	// C. Handle actions

	const handleUserLocationSuccess = useCallback((position: GeolocationPosition) => {
		setUserLocationError(null);
		setUserLocation(prev => ({
			...prev,
			accuracy: position.coords.accuracy,
			latitude: position.coords.latitude,
			longitude: position.coords.longitude,
		}));
	}, []);

	const handleUserLocationError = useCallback((error: GeolocationPositionError) => {
		setUserLocationError(error.message);
	}, []);

	const requestUserLocationPermission = useCallback(() => {
		if (!navigator.geolocation) {
			setUserLocationError('Geolocation is not supported');
			return;
		}

		navigator.geolocation.getCurrentPosition(
			(position) => {
				handleUserLocationSuccess(position);
				setUserLocationTrackingMode('follow');
			},
			handleUserLocationError,
			{
				enableHighAccuracy: true,
				maximumAge: 0,
				timeout: 10_000,
			},
		);
	}, [handleUserLocationError, handleUserLocationSuccess, setUserLocationTrackingMode]);

	//
	// D. Synchronize browser state

	useEffect(() => {
		if (!navigator.geolocation) {
			setUserLocationError('Geolocation is not supported');
			return;
		}

		const watchId = navigator.geolocation.watchPosition(handleUserLocationSuccess, handleUserLocationError, {
			enableHighAccuracy: true,
			maximumAge: 0,
			timeout: 10_000,
		});

		return () => {
			navigator.geolocation.clearWatch(watchId);
		};
	}, [handleUserLocationError, handleUserLocationSuccess]);

	useEffect(() => {
		(async () => {
			if (userLocationTrackingMode !== 'follow-bearing') return;
			if (typeof DeviceOrientationEvent === 'undefined') {
				setUserLocationTrackingMode('follow');
				setDeviceOrientationError('Device orientation is not supported');
				return;
			}
			if (typeof DeviceOrientationEvent['requestPermission'] !== 'function') {
				setDeviceOrientationError(null);
				return;
			}

			const permission = await DeviceOrientationEvent['requestPermission']();
			if (permission !== 'granted') {
				setUserLocationTrackingMode('follow');
				setDeviceOrientationError('Device orientation permission denied');
				return;
			}
			setDeviceOrientationError(null);
		})();
	}, [setUserLocationTrackingMode, userLocationTrackingMode]);

	useEffect(() => {
		const handleOrientation = (event: DeviceOrientationEvent) => {
			if (Number.isNaN(event.alpha)) return;
			setUserLocation(prev => ({ ...prev, bearing: event.alpha }));
		};

		window.addEventListener('deviceorientationabsolute', handleOrientation, true);
		window.addEventListener('deviceorientation', handleOrientation, true);
		return () => {
			window.removeEventListener('deviceorientationabsolute', handleOrientation, true);
			window.removeEventListener('deviceorientation', handleOrientation, true);
		};
	}, []);

	//
	// E. Define context value

	const contextValue = useMemo<UserLocationContextState>(() => ({
		availableUserLocationTrackingModes,
		requestUserLocationPermission,
		setUserLocationTrackingMode,
		userLocation,
		userLocationTrackingMode,
	}), [availableUserLocationTrackingModes, requestUserLocationPermission, setUserLocationTrackingMode, userLocation, userLocationTrackingMode]);

	//
	// F. Render components

	return (
		<UserLocationContext.Provider value={contextValue}>
			{children}
		</UserLocationContext.Provider>
	);

	//
}
