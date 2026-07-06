'use client';

import { useLinesContext } from '@/components/lines/Lines.context';
import { useMapContext } from '@/components/map/Map.context';
import { MapViewOverlayVehiclesInteractiveLayerId } from '@/components/map/overlays/MapViewOverlayVehicles';
import { useDebouncedCallback } from '@mantine/hooks';
import { type HubVehiclePosition } from '@tmlmobilidade/go-types-public-info';
import { Marker } from '@vis.gl/react-maplibre';
import { useState } from 'react';

import styles from './styles.module.css';

/* * */

const LINE_BADGE_MIN_ZOOM = 16;

/* * */

interface VehicleLineBadge {
	_id: string
	color: string
	latitude: number
	longitude: number
	short_name: string
	text_color: string
	vehicle_id: string
}

interface MapViewOverlayVehicleLineBadgesProps {
	visible?: boolean
}

/* * */

export function MapViewOverlayVehicleLineBadges({ visible }: MapViewOverlayVehicleLineBadgesProps) {
	//

	//
	// A. Setup variables

	const mapContext = useMapContext();
	const linesContext = useLinesContext();

	const [visibleBadges, setVisibleBadges] = useState<VehicleLineBadge[]>([]);

	//
	// B. Transform data

	const updateVisibleBadges = useDebouncedCallback(() => {
		// Skip if map is not ready
		if (!mapContext.data.map) return [];
		// If zoom is less than the minimum zoom, skip
		if (mapContext.data.map.getZoom() < LINE_BADGE_MIN_ZOOM) {
			setVisibleBadges([]);
			return;
		}
		// Get rendered features for the stops interactive layer
		const vehiclesInViewport = mapContext.data.map.queryRenderedFeatures({
			layers: [MapViewOverlayVehiclesInteractiveLayerId],
		});
		// For each stop in viewport, get associated line data
		// and create a badge group, sorting by short name
		const badgeGroups: VehicleLineBadge[] = [];
		vehiclesInViewport.forEach((vehicleFeature) => {
			const properties = vehicleFeature.properties as HubVehiclePosition;
			const lineData = linesContext.data.lines.find(line => line._id === properties.line_id);
			if (!lineData) return;
			badgeGroups.push({
				_id: String(properties._id),
				color: lineData.color,
				latitude: properties.latitude,
				longitude: properties.longitude,
				short_name: lineData.short_name,
				text_color: lineData.text_color,
				vehicle_id: properties.vehicle_id,
			});
		});
		setVisibleBadges(badgeGroups);
	}, 500);

	//
	// C. Handle actions

	mapContext.data.map?.on('moveend', updateVisibleBadges);
	mapContext.data.map?.on('rotate', updateVisibleBadges);
	mapContext.data.map?.on('pitch', updateVisibleBadges);
	mapContext.data.map?.on('zoomend', updateVisibleBadges);

	//
	// D. Render components

	if (!visible) return null;

	return visibleBadges.map(badge => (
		<Marker
			key={badge._id}
			anchor="left"
			className={styles.badge}
			latitude={badge.latitude}
			longitude={badge.longitude}
			pitchAlignment="viewport"
			rotationAlignment="viewport"
			style={{ backgroundColor: badge.color, color: badge.text_color }}
		>
			{badge.short_name}
		</Marker>
	));
}
