'use client';

import { useMapContext } from '@/components/map/Map.context';
import { moveMap } from '@/utils/map.utils';
import { useLocalStorage } from '@mantine/hooks';
import { useCallback, useState } from 'react';

/* * */

type BaseMapOverlayType = 'alerts' | 'stops' | 'vehicles';

type UserLocation = [longitude: number, latitude: number];

interface UseBaseMapReturnType {
	activeBaseMapOverlays: BaseMapOverlayType[]
	centerMapOnUserLocation: () => Promise<void>
	isRequestingUserLocation: boolean
	requestUserLocation: () => Promise<UserLocation>
	toggleBaseMapOverlay: (overlay: BaseMapOverlayType) => void
	userLocation: null | UserLocation
	userLocationError: null | string
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
export function useBaseMap(): UseBaseMapReturnType {
	//

	//
	// A. Setup variables

	const mapContext = useMapContext();

	const [activeBaseMapOverlays, setActiveBaseMapOverlays] = useLocalStorage<BaseMapOverlayType[]>({
		defaultValue: ['alerts', 'stops', 'vehicles'],
		key: 'active-viewport-map-sources',
	});

	const [userLocation, setUserLocation] = useState<null | UserLocation>(null);
	const [isRequestingUserLocation, setIsRequestingUserLocation] = useState(false);
	const [userLocationError, setUserLocationError] = useState<null | string>(null);

	//
	// B. Handle actions

	const toggleBaseMapOverlay = (source: BaseMapOverlayType) => {
		setActiveBaseMapOverlays((prev) => {
			// Create a new set with the previous sources
			const result = new Set([...prev]);
			// Toggle the source
			if (result.has(source)) result.delete(source);
			else result.add(source);
			// Return the new sources as an array
			return Array.from(result);
		});
	};

	const requestUserLocation = useCallback((): Promise<UserLocation> => {
		return new Promise((resolve, reject) => {
			if (!navigator.geolocation) {
				const message = 'Geolocation is not supported';
				setUserLocationError(message);
				reject(new Error(message));
				return;
			}

			setIsRequestingUserLocation(true);
			setUserLocationError(null);

			navigator.geolocation.getCurrentPosition(
				(position) => {
					const coordinates: UserLocation = [
						position.coords.longitude,
						position.coords.latitude,
					];
					setUserLocation(coordinates);
					setIsRequestingUserLocation(false);
					resolve(coordinates);
				},
				(error) => {
					const message = getGeolocationErrorMessage(error);
					setUserLocationError(message);
					setIsRequestingUserLocation(false);
					reject(new Error(message));
				},
				{
					enableHighAccuracy: true,
					maximumAge: 0,
					timeout: 10_000,
				},
			);
		});
	}, []);

	const centerMapOnUserLocation = useCallback(async () => {
		if (!mapContext.data.map) return;
		try {
			const coordinates = userLocation ?? await requestUserLocation();
			moveMap(mapContext.data.map, coordinates);
		} catch {
			// Error state is already set by requestUserLocation
		}
	}, [mapContext.data.map, requestUserLocation, userLocation]);

	//
	// C. Return data

	return {
		activeBaseMapOverlays,
		centerMapOnUserLocation,
		isRequestingUserLocation,
		requestUserLocation,
		toggleBaseMapOverlay,
		userLocation,
		userLocationError,
	};
}
