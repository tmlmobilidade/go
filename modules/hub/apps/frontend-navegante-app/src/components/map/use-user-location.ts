'use client';

import { useLocalStorage } from '@mantine/hooks';
import { Logger } from '@tmlmobilidade/logger';
import { useEffect, useState } from 'react';

/* * */

export type UserLocationTrackingMode = 'disabled' | 'follow' | 'follow-bearing';

interface UseUserLocationReturnType {
	setUserLocationTrackingMode: (mode: UserLocationTrackingMode) => void
	toggleUserLocationTrackingMode: () => void
	userLocation: GeolocationPosition | null
	userLocationError: null | string
	userLocationTrackingMode: UserLocationTrackingMode
}

/**
 * A hook that manages base map overlays and user location actions.
 * @returns An object with overlay state, user location state, and map actions.
 */
export function useUserLocation(): UseUserLocationReturnType {
	//

	//
	// A. Setup variables

	const [userLocationError, setUserLocationError] = useState<null | string>(null);
	const [userLocation, setUserLocation] = useState<GeolocationPosition | null>(null);

	const [userLocationTrackingMode, setUserLocationTrackingMode] = useLocalStorage<UserLocationTrackingMode>({
		defaultValue: 'follow',
		key: 'user-location-tracking-mode',
	});

	//
	// B. Handle actions

	const toggleUserLocationTrackingMode = () => {
		setUserLocationTrackingMode((prev) => {
			if (prev === 'follow') return 'follow-bearing';
			if (prev === 'follow-bearing') return 'disabled';
			return 'follow';
		});
	};

	useEffect(() => {
		// Skip if geolocation is not supported
		if (!navigator.geolocation) {
			setUserLocationError('Geolocation is not supported');
			return;
		}
		// Set the callback functions to handle the success and error cases
		const successCallback = (position: GeolocationPosition) => {
			setUserLocationError(null);
			// Skip if tracking mode is disabled
			if (userLocationTrackingMode === 'disabled') return;
			// Update user location
			setUserLocation(position);
			Logger.info(`User location coordinates updated to ${position.coords.longitude}, ${position.coords.latitude}`);
		};
		const errorCallback = (error: GeolocationPositionError) => {
			Logger.error(`User location error: ${error.code} - ${error.message}`);
			setUserLocationError(error.message);
		};
		// Watch for user location changes
		const watchId = navigator.geolocation.watchPosition(successCallback, errorCallback, {
			enableHighAccuracy: true,
			maximumAge: 1_000,
			timeout: 10_000,
		});
		// Clean up the watch when the component unmounts
		return () => {
			navigator.geolocation.clearWatch(watchId);
		};
	}, []);

	//
	// C. Return data

	return {
		setUserLocationTrackingMode,
		toggleUserLocationTrackingMode,
		userLocation,
		userLocationError,
		userLocationTrackingMode,
	};
}
