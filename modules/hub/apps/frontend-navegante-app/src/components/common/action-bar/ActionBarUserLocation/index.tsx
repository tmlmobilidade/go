'use client';

import { ActionBarButton } from '@/components/common/action-bar/ActionBarButton';
import { useMapContext } from '@/components/map/Map.context';
import { useUserLocation } from '@/components/map/use-user-location';
import { IconCurrentLocation, IconCurrentLocationFilled, IconLocationOff, IconNavigationTop } from '@tabler/icons-react';

/* * */

export function ActionBarUserLocation() {
	//

	//
	// A. Setup variables

	const { actions: { moveMap } } = useMapContext();

	const { availableUserLocationTrackingModes, setUserLocationTrackingMode, userLocation, userLocationTrackingMode } = useUserLocation();

	//
	// B. Handle actions

	const handleIdleOrFollowBearingClick = () => {
		// If the next tracking mode is not available, do nothing
		if (!availableUserLocationTrackingModes.includes('follow')) return;
		// Move the map to the user location and update the tracking mode to follow
		moveMap({ isUserInitiated: true, latitude: userLocation?.latitude, longitude: userLocation?.longitude });
		setUserLocationTrackingMode('follow');
	};

	const handleFollowClick = () => {
		// Move the map to the user location first
		moveMap({ isUserInitiated: true, latitude: userLocation?.latitude, longitude: userLocation?.longitude });
		// If follow-bearing tracking mode is not available, exit early
		if (!availableUserLocationTrackingModes.includes('follow-bearing')) return;
		setUserLocationTrackingMode('follow-bearing');
	};

	//
	// C. Render components

	if (availableUserLocationTrackingModes.length < 2) {
		return (
			<ActionBarButton
				icon={<IconLocationOff size={28} />}
				variant="disabled"
			/>
		);
	}

	if (userLocationTrackingMode === 'idle') {
		return (
			<ActionBarButton
				icon={<IconCurrentLocation size={28} />}
				onClick={handleIdleOrFollowBearingClick}
			/>
		);
	}

	if (userLocationTrackingMode === 'follow') {
		return (
			<ActionBarButton
				icon={<IconCurrentLocationFilled size={28} />}
				onClick={handleFollowClick}
				variant="active"
			/>
		);
	}

	if (userLocationTrackingMode === 'follow-bearing') {
		return (
			<ActionBarButton
				icon={<IconNavigationTop size={32} />}
				onClick={handleIdleOrFollowBearingClick}
				variant="active"
			/>
		);
	}
}
