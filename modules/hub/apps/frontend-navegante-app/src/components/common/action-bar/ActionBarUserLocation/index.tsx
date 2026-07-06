'use client';

import { ActionBarButton } from '@/components/common/action-bar/ActionBarButton';
import { useMapContext } from '@/components/map/Map.context';
import { useUserLocation } from '@/components/map/use-user-location';
import { IconCurrentLocation, IconCurrentLocationFilled, IconLocationOff, IconNavigationTop } from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';

/* * */

export function ActionBarUserLocation() {
	//

	//
	// A. Setup variables

	const { t } = useTranslation();

	const mapContext = useMapContext();

	const { availableUserLocationTrackingModes, setUserLocationTrackingMode, userLocation, userLocationTrackingMode } = useUserLocation();

	//
	// B. Handle actions

	const handleIdleOrFollowBearingClick = () => {
		// If the next tracking mode is not available, do nothing
		if (!availableUserLocationTrackingModes.includes('follow')) return;
		// Move the map to the user location and update the tracking mode to follow
		mapContext.actions.moveMap({ isUserInitiated: true, latitude: userLocation?.latitude, longitude: userLocation?.longitude });
		setUserLocationTrackingMode('follow');
	};

	const handleFollowClick = () => {
		// Move the map to the user location first
		mapContext.actions.moveMap({ isUserInitiated: true, latitude: userLocation?.latitude, longitude: userLocation?.longitude });
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
				label={t('default:action-bar.ActionBarUserLocation.disabled.label')}
				variant="disabled"
			/>
		);
	}

	if (userLocationTrackingMode === 'idle') {
		return (
			<ActionBarButton
				icon={<IconCurrentLocation size={28} />}
				label={t('default:action-bar.ActionBarUserLocation.idle.label')}
				onClick={handleIdleOrFollowBearingClick}
			/>
		);
	}

	if (userLocationTrackingMode === 'follow') {
		return (
			<ActionBarButton
				icon={<IconCurrentLocationFilled size={28} />}
				label={t('default:action-bar.ActionBarUserLocation.follow.label')}
				onClick={handleFollowClick}
				variant="active"
			/>
		);
	}

	if (userLocationTrackingMode === 'follow-bearing') {
		return (
			<ActionBarButton
				icon={<IconNavigationTop size={32} />}
				label={t('default:action-bar.ActionBarUserLocation.follow-bearing.label')}
				onClick={handleIdleOrFollowBearingClick}
				variant="active"
			/>
		);
	}
}
