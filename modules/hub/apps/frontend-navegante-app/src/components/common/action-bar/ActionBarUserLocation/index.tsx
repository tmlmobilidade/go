'use client';

import { ActionBarButton } from '@/components/common/action-bar/ActionBarButton';
import { useMapContext } from '@/contexts/Map.context';
import { useUserLocation } from '@/contexts/UserLocation.context';
import { IconCurrentLocation, IconCurrentLocationFilled, IconLocationOff, IconNavigationTop } from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';

/* * */

export function ActionBarUserLocation() {
	//

	//
	// A. Setup variables

	const { t } = useTranslation();
	const mapContext = useMapContext();
	const userLocationContext = useUserLocation();

	//
	// B. Handle actions

	const handleIdleOrFollowBearingClick = async () => {
		const location = await userLocationContext.actions.followUserLocation();
		if (!location) return;
		mapContext.actions.moveMap({ isUserInitiated: true, latitude: location.latitude, longitude: location.longitude });
	};

	const handleFollowClick = async () => {
		const location = await userLocationContext.actions.enableBearingTracking();
		if (!location) return;
		mapContext.actions.moveMap({ isUserInitiated: true, latitude: location.latitude, longitude: location.longitude });
	};

	//
	// C. Render components

	if (userLocationContext.data.available_tracking_modes.length < 2) {
		return (
			<ActionBarButton
				icon={<IconLocationOff size={28} />}
				label={t('default:action-bar.ActionBarUserLocation.disabled.label')}
				onClick={handleIdleOrFollowBearingClick}
				variant="disabled"
			/>
		);
	}

	if (userLocationContext.data.tracking_mode === 'idle') {
		return (
			<ActionBarButton
				icon={<IconCurrentLocation size={28} />}
				label={t('default:action-bar.ActionBarUserLocation.idle.label')}
				onClick={handleIdleOrFollowBearingClick}
			/>
		);
	}

	if (userLocationContext.data.tracking_mode === 'follow') {
		return (
			<ActionBarButton
				icon={<IconCurrentLocationFilled size={28} />}
				label={t('default:action-bar.ActionBarUserLocation.follow.label')}
				onClick={handleFollowClick}
				variant="active"
			/>
		);
	}

	if (userLocationContext.data.tracking_mode === 'follow-bearing') {
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
