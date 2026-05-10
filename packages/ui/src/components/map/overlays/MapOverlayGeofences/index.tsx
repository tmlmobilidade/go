'use client';

import { Layer, Source } from '@vis.gl/react-maplibre';
import { type FeatureCollection, type Polygon } from 'geojson';
import { useEffect } from 'react';

import { useCssVariable } from '../../../../hooks/use-css-variable';
import { useMapViewContext } from '../../view/MapViewContext';

/* * */

export interface MapOverlayGeofencesPolygonDataProps {
	id: string
}

/* * */

interface MapOverlayGeofencesProps {
	geofencesData?: FeatureCollection<Polygon, MapOverlayGeofencesPolygonDataProps> | null
	id: string
	visible?: boolean
}

/* * */

export function MapOverlayGeofences({ geofencesData, id, visible = true }: MapOverlayGeofencesProps) {
	//

	//
	// A. Setup variables

	const mapViewContext = useMapViewContext();

	const primaryColorHexValue = useCssVariable('--color-primary', '#000000');

	//
	// B. Handle actions

	useEffect(() => {
		// Register features for sources in this overlay component
		if (geofencesData) mapViewContext.actions.registerOverlaySource(`${id}:geofences:source:polygons`, geofencesData);
		return () => {
			mapViewContext.actions.unregisterOverlaySource(`${id}:geofences:source:polygons`);
		};
	}, [geofencesData]);

	//
	// C. Render components

	if (!geofencesData) {
		return null;
	}

	return (
		<Source data={geofencesData} id={`${id}:geofences:source:polygons`} type="geojson" generateId>
			<Layer
				id={`${id}:geofences:layer:polygons-fill`}
				source={`${id}:geofences:source:polygons`}
				type="fill"
				layout={{
					visibility: visible ? 'visible' : 'none',
				}}
				paint={{
					'fill-color': primaryColorHexValue,
					'fill-opacity': 0.25,
				}}
			/>
			<Layer
				id={`${id}:geofences:layer:polygons-border`}
				source={`${id}:geofences:source:polygons`}
				type="line"
				layout={{
					'line-cap': 'round',
					'line-join': 'round',
					'visibility': visible ? 'visible' : 'none',
				}}
				paint={{
					'line-color': primaryColorHexValue,
					'line-width': [
						'interpolate',
						['linear'],
						['zoom'],
						10, // min zoom level
						0.5, // min radius
						20, // max zoom level
						5, // max radius
					],
				}}
			/>
		</Source>
	);

	//
}
