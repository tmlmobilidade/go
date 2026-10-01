'use client';

import { RoutePlannerLinePill } from '@/components/routes/common/RoutePlannerLinePill';
import { useMapContext } from '@/contexts/Map.context';
import { useLinesByShortName } from '@/hooks/route-planner/useLinesByShortName';
import { isMotisWalkingLeg } from '@/utils/route-planner/presentation/modes';
import { type MotisItinerary } from '@tmlmobilidade/go-types-motis';
import { along, length, lineString } from '@turf/turf';
import { Marker } from '@vis.gl/react-maplibre';
import { useEffect, useMemo, useState } from 'react';

import styles from './styles.module.css';

/* * */

interface MapViewOverlayRouteLegBadgesProps {
	itinerary: MotisItinerary
	shapeData: GeoJSON.FeatureCollection<GeoJSON.LineString>
}

/* * */

export function MapViewOverlayRouteLegBadges({ itinerary, shapeData }: MapViewOverlayRouteLegBadgesProps) {
	//

	//
	// A. Setup variables

	const lineByShortName = useLinesByShortName();
	const { data: { map } } = useMapContext();
	const [zoom, setZoom] = useState(() => map?.getZoom() ?? 14);

	//
	// B. Transform data

	const badgeScale = Math.min(1, Math.max(0.58, 0.58 + (zoom - 9) * 0.084));
	const badges = useMemo(() => shapeData.features.flatMap((feature) => {
		const legIndex = feature.properties?.leg_index;
		const leg = typeof legIndex === 'number' ? itinerary.legs[legIndex] : undefined;
		if (!leg || isMotisWalkingLeg(leg) || feature.geometry.coordinates.length < 2) return [];

		const path = lineString(feature.geometry.coordinates);
		const coordinate = along(path, length(path) / 2).geometry.coordinates;
		if (!Number.isFinite(coordinate[0]) || !Number.isFinite(coordinate[1])) return [];

		return [{ coordinate, leg, legIndex }];
	}), [itinerary.legs, shapeData.features]);

	//
	// C. Handle actions

	useEffect(() => {
		if (!map) return;
		const updateZoom = () => setZoom(map.getZoom());
		updateZoom();
		map.on('zoom', updateZoom);
		return () => {
			map.off('zoom', updateZoom);
		};
	}, [map]);

	//
	// D. Render components

	return badges.map(({ coordinate, leg, legIndex }) => (
		<Marker key={legIndex} anchor="bottom" latitude={coordinate[1]} longitude={coordinate[0]} offset={[0, -12]}>
			<div aria-hidden="true" className={styles.badge} data-route-leg-index={legIndex} style={{ transform: `scale(${badgeScale})` }}>
				<RoutePlannerLinePill leg={leg} lineByShortName={lineByShortName} size="md" />
			</div>
		</Marker>
	));
}
