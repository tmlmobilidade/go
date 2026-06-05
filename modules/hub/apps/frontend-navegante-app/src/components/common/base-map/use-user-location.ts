'use client';

import { useEffect, useState } from 'react';

/* * */

export type UserLocationCoordinates = [longitude: number, latitude: number];

interface UseUserLocationReturnType {
	userLocationCoordinates: null | UserLocationCoordinates
	userLocationError: null | string
	userLocationLoading: boolean
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

	const [userLocationLoading, setUserLocationLoading] = useState(false);
	const [userLocationError, setUserLocationError] = useState<null | string>(null);

	const [userLocationCoordinates, setUserLocationCoordinates] = useState<null | UserLocationCoordinates>(null);

	//
	// B. Handle actions

	const requestUserLocation = () => {
		// Skip if geolocation is not supported
		if (!navigator.geolocation) {
			setUserLocationError('Geolocation is not supported');
			setUserLocationLoading(false);
			return;
		}
		// Set loading and clear error states
		setUserLocationLoading(true);
		setUserLocationError(null);
		// Set the callback functions to handle the success and error cases
		const successCallback = (position: GeolocationPosition) => {
			setUserLocationLoading(false);
			setUserLocationCoordinates([position.coords.longitude, position.coords.latitude]);
		};
		const errorCallback = (error: GeolocationPositionError) => {
			const message = getGeolocationErrorMessage(error);
			setUserLocationError(message);
			setUserLocationLoading(false);
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
		userLocationCoordinates,
		userLocationError,
		userLocationLoading,
	};
}
