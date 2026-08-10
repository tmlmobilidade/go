'use client';

import { Layer, type MapMouseEvent, Popup, Source } from '@vis.gl/react-maplibre';
import { type Feature, type FeatureCollection, type Point } from 'geojson';
import { useEffect, useState } from 'react';

import styles from './styles.module.css';

import { useCssVariable } from '../../../../hooks/use-css-variable';
import { useMapViewContext } from '../../view/MapViewContext';

/* * */

export interface MapOverlayMultipleStopsDataProps {
	color?: string
	id: string
	name: string
	sequence?: number
	text_color?: string
}

/* * */

interface MapOverlayMultipleStopsProps {
	data?: FeatureCollection<Point, MapOverlayMultipleStopsDataProps> | null
	id: string
	onClick?: (value: MapOverlayMultipleStopsDataProps) => void
	visible: boolean
}

/* * */

export function MapOverlayMultipleStops({ data, id, onClick, visible = true }: MapOverlayMultipleStopsProps) {
	//

	//
	// A. Setup variables

	const mapViewContext = useMapViewContext();

	const interactiveLayerIds = [`${id}:multiple-stops:layer:points`];

	const primaryColorHexValue = useCssVariable('--color-primary', '#000000');
	const secondaryColorHexValue = useCssVariable('--color-secondary', '#000000');

	const [hoveredFeature, setHoveredFeature] = useState<Feature<Point, MapOverlayMultipleStopsDataProps> | null>(null);

	//
	// B. Handle actions

	useEffect(() => {
		// Register features for sources in this overlay component
		if (data) mapViewContext.actions.registerOverlaySource(`${id}:multiple-stops:source:points`, data);
		return () => {
			mapViewContext.actions.unregisterOverlaySource(`${id}:multiple-stops:source:points`);
		};
	}, [data]);

	const handleClickEvent = (event: MapMouseEvent) => {
		const relevantFeature = event.target
			.queryRenderedFeatures(event.point)
			.find(feature => interactiveLayerIds.includes(feature.layer.id));
		if (!relevantFeature) return;
		if (onClick) onClick(relevantFeature.properties as MapOverlayMultipleStopsDataProps);
	};

	const handleMouseOverEvent = (event: MapMouseEvent) => {
		const relevantFeature = event.target
			.queryRenderedFeatures(event.point)
			.find(feature => interactiveLayerIds.includes(feature.layer.id));
		if (!relevantFeature) {
			setHoveredFeature(null);
			mapViewContext.actions.toggleCursor('auto');
			return;
		}
		if (onClick) mapViewContext.actions.toggleCursor('pointer');
		setHoveredFeature(relevantFeature as unknown as Feature<Point, MapOverlayMultipleStopsDataProps>);
	};

	useEffect(() => {
		// Skip if no map collection is available
		if (!mapViewContext.ref.map.current) return;
		// Attach a click event listener to the map
		// so that when a feature is interacted with, we can handle it here.
		mapViewContext.ref.map.current.on('click', handleClickEvent);
		mapViewContext.ref.map.current.on('mousemove', handleMouseOverEvent);
	}, [mapViewContext.ref.map.current]);

	//
	// C. Render components

	if (!data) {
		return null;
	}

	return (
		<Source data={data} id={`${id}:multiple-stops:source:points`} type="geojson" generateId>

			{hoveredFeature && (
				<Popup
					anchor="bottom"
					closeButton={false}
					latitude={hoveredFeature.geometry.coordinates[1] ?? 0}
					longitude={hoveredFeature.geometry.coordinates[0] ?? 0}
					maxWidth="300px"
					offset={12}
				>
					<div className={styles.popup}>
						<span className={styles.id}>#{hoveredFeature.properties.id}</span>
						<span className={styles.name}>{hoveredFeature.properties.name}</span>
					</div>
				</Popup>
			)}

			<Layer
				id={`${id}:multiple-stops:layer:points`}
				source={`${id}:multiple-stops:source:points`}
				type="circle"
				layout={{
					visibility: visible ? 'visible' : 'none',
				}}
				paint={{
					'circle-color': primaryColorHexValue,
					'circle-pitch-alignment': 'map',
					'circle-radius': [
						'interpolate',
						['linear'],
						['zoom'],
						9, // min zoom level
						1, // min radius
						26, // max zoom level
						22, // max radius
					],
					'circle-stroke-color': secondaryColorHexValue,
					'circle-stroke-width': [
						'interpolate',
						['linear'],
						['zoom'],
						9, // min zoom level
						1, // min stroke width
						26, // max zoom level
						10, // max stroke width
					],
				}}
			/>

		</Source>
	);

	//
}
