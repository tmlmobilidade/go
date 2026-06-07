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
				ariaHint={t('default:action-bar.ActionBarUserLocation.disabled.aria-hint')}
				ariaLabel={t('default:action-bar.ActionBarUserLocation.disabled.aria-label')}
				icon={<IconLocationOff size={28} />}
				variant="disabled"
			/>
		);
	}

	if (userLocationTrackingMode === 'idle') {
		return (
			<ActionBarButton
				ariaHint={t('default:action-bar.ActionBarUserLocation.idle.aria-hint')}
				ariaLabel={t('default:action-bar.ActionBarUserLocation.idle.aria-label')}
				icon={<IconCurrentLocation size={28} />}
				onClick={handleIdleOrFollowBearingClick}
			/>
		);
	}

	if (userLocationTrackingMode === 'follow') {
		return (
			<ActionBarButton
				ariaHint={t('default:action-bar.ActionBarUserLocation.follow.aria-hint')}
				ariaLabel={t('default:action-bar.ActionBarUserLocation.follow.aria-label')}
				icon={<IconCurrentLocationFilled size={28} />}
				onClick={handleFollowClick}
				variant="active"
			/>
		);
	}

	if (userLocationTrackingMode === 'follow-bearing') {
		return (
			<ActionBarButton
				ariaHint={t('default:action-bar.ActionBarUserLocation.follow-bearing.aria-hint')}
				ariaLabel={t('default:action-bar.ActionBarUserLocation.follow-bearing.aria-label')}
				icon={<IconNavigationTop size={32} />}
				onClick={handleIdleOrFollowBearingClick}
				variant="active"
			/>
		);
	}
}
