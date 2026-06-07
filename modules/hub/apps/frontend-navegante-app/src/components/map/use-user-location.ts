'use client';

import { useSessionStorage } from '@mantine/hooks';
import { Logger } from '@tmlmobilidade/logger';
import { useEffect, useMemo, useState } from 'react';

/* * */

export type UserLocationTrackingMode = 'follow' | 'follow-bearing' | 'idle';

export interface UserLocation {
	accuracy: null | number
	bearing: null | number
	latitude: number
	longitude: number
}

interface UseUserLocationReturnType {
	availableUserLocationTrackingModes: UserLocationTrackingMode[]
	setUserLocationTrackingMode: (mode: UserLocationTrackingMode) => void
	userLocation: null | UserLocation
	userLocationTrackingMode: UserLocationTrackingMode
}

/**
 * A hook that manages user location tracking.
 * @returns An object with user location tracking mode, user location state, and user location tracking actions.
 */
export function useUserLocation(): UseUserLocationReturnType {
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
	}, [userLocationError, deviceOrientationError]);

	//
	// C. Handle actions

	useEffect(() => {
		// Skip if geolocation is not supported
		if (!navigator.geolocation) {
			setUserLocationError('Geolocation is not supported');
			return;
		}
		// Set the callback functions to handle the success and error cases
		const successCallback = (position: GeolocationPosition) => {
			setUserLocationError(null);
			// Update user location
			setUserLocation(prev => ({
				...prev,
				accuracy: position.coords.accuracy,
				latitude: position.coords.latitude,
				longitude: position.coords.longitude,
			}));
			Logger.info(`User location coordinates updated to ${position.coords.longitude}, ${position.coords.latitude}`);
		};
		const errorCallback = (error: GeolocationPositionError) => {
			Logger.info(`User location error: ${error.code} - ${error.message}`);
			setUserLocationError(error.message);
		};
		// Watch for user location changes
		const watchId = navigator.geolocation.watchPosition(successCallback, errorCallback, {
			enableHighAccuracy: true,
			maximumAge: 0,
			timeout: 10_000,
		});
		// Clean up the watch when the component unmounts
		return () => {
			navigator.geolocation.clearWatch(watchId);
		};
	}, []);

	useEffect(() => {
		(async () => {
			// Skip if tracking mode is not follow-bearing
			if (userLocationTrackingMode !== 'follow-bearing') return;
			// Skip if DeviceOrientationEvent is not supported
			if (typeof DeviceOrientationEvent === 'undefined') {
				setUserLocationTrackingMode('follow');
				setDeviceOrientationError('Device orientation is not supported');
				return;
			}
			// DeviceOrientationEvent.requestPermission is only present on some platforms (iOS)
			// If not present, permission is considered granted by default (legacy browsers)
			if (typeof DeviceOrientationEvent['requestPermission'] !== 'function') {
				setDeviceOrientationError(null);
				return;
			}
			// Request device orientation permission
			const permission = await DeviceOrientationEvent['requestPermission']();
			if (permission !== 'granted') {
				setUserLocationTrackingMode('follow');
				setDeviceOrientationError('Device orientation permission denied');
				return;
			}
			setDeviceOrientationError(null);
		})();
	}, [userLocationTrackingMode]);

	useEffect(() => {
		// Handle device orientation
		const handleOrientation = (event: DeviceOrientationEvent) => {
			if (Number.isNaN(event.alpha)) return;
			setUserLocation(prev => ({ ...prev, bearing: event.alpha }));
		};
		// Subscribe to device orientation changes
		window.addEventListener('deviceorientationabsolute', handleOrientation, true);
		window.addEventListener('deviceorientation', handleOrientation, true);
		return () => {
			window.removeEventListener('deviceorientationabsolute', handleOrientation, true);
			window.removeEventListener('deviceorientation', handleOrientation, true);
		};
	}, []);

	//
	// D. Return data

	return {
		availableUserLocationTrackingModes,
		setUserLocationTrackingMode,
		userLocation,
		userLocationTrackingMode,
	};
}
