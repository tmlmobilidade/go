'use client';

import { useLocalStorage } from '@mantine/hooks';
import { useEffect, useState } from 'react';

/* * */

export type UserLocationCoordinates = [longitude: number, latitude: number];

export type UserLocationTrackingMode = 'disabled' | 'follow' | 'follow-bearing';

interface UseUserLocationReturnType {
	setUserLocationTrackingMode: (mode: UserLocationTrackingMode) => void
	toggleUserLocationTrackingMode: () => void
	userLocationCoordinates: null | UserLocationCoordinates
	userLocationError: null | string
	userLocationTrackingMode: UserLocationTrackingMode
}

/* * */

function getGeolocationErrorMessage(error: GeolocationPositionError): string {
	switch (error.code) {
		case error.PERMISSION_DENIED:
			return 'Location permission denied';
		case error.POSITION_UNAVAILABLE:
			return 'Location unavailable';
		case error.TIMEOUT:
			return 'Location request timed out';
		default:
			return 'Failed to get location';
	}
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
	const [userLocationCoordinates, setUserLocationCoordinates] = useState<null | UserLocationCoordinates>(null);

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

	const requestUserLocation = () => {
		// Skip if geolocation is not supported
		if (!navigator.geolocation) {
			setUserLocationError('Geolocation is not supported');
			return;
		}
		// Set loading and clear error states
		setUserLocationError(null);
		// Set the callback functions to handle the success and error cases
		const successCallback = (position: GeolocationPosition) => {
			setUserLocationCoordinates([position.coords.longitude, position.coords.latitude]);
		};
		const errorCallback = (error: GeolocationPositionError) => {
			const message = getGeolocationErrorMessage(error);
			setUserLocationError(message);
		};
		// Request user location using the browser's geolocation API
		navigator.geolocation.getCurrentPosition(successCallback, errorCallback, {
			enableHighAccuracy: true,
			maximumAge: 0,
			timeout: 10_000,
		});
	};

	useEffect(() => {
		let timeout: null | ReturnType<typeof setTimeout> = null;
		const updateUserLocation = () => {
			requestUserLocation();
			timeout = setTimeout(updateUserLocation, 1_000);
		};
		updateUserLocation();
		return () => clearTimeout(timeout);
	}, []);

	//
	// C. Return data

	return {
		setUserLocationTrackingMode,
		toggleUserLocationTrackingMode,
		userLocationCoordinates,
		userLocationError,
		userLocationTrackingMode,
	};
}
