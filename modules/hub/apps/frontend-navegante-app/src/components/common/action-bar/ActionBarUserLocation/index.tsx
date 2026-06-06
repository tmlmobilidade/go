'use client';

import { ActionBarButton } from '@/components/common/action-bar/ActionBarButton';
import { useUserLocation } from '@/components/map/use-user-location';
import { IconCurrentLocation, IconCurrentLocationFilled, IconLocationOff, IconNavigationTop } from '@tabler/icons-react';

/* * */

export function ActionBarUserLocation() {
	//

	//
	// A. Setup variables

	const { toggleUserLocationTrackingMode, userLocationError, userLocationTrackingMode } = useUserLocation();

	//
	// B. Render components

	if (userLocationError) {
		return (
			<ActionBarButton
				icon={<IconLocationOff size={28} />}
				variant="disabled"
			/>
		);
	}

	if (userLocationTrackingMode === 'disabled') {
		return (
			<ActionBarButton
				icon={<IconCurrentLocation size={28} />}
				onClick={toggleUserLocationTrackingMode}
			/>
		);
	}

	if (userLocationTrackingMode === 'follow') {
		return (
			<ActionBarButton
				icon={<IconCurrentLocationFilled size={28} />}
				onClick={toggleUserLocationTrackingMode}
				variant="active"
			/>
		);
	}

	if (userLocationTrackingMode === 'follow-bearing') {
		return (
			<ActionBarButton
				icon={<IconNavigationTop size={32} />}
				onClick={toggleUserLocationTrackingMode}
				variant="active"
			/>
		);
	}
}
