'use client';

// import { LiveIcon } from '@/components/common/LiveIcon';
import { LiveIcon } from '@/components/common/LiveIcon';
import { getBaseGeoJsonFeatureCollection } from '@tmlmobilidade/geo';
import { Layer, Source } from '@vis.gl/react-maplibre';
import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';

import styles from './styles.module.css';

/* * */

export const MapViewStyleVehiclesPrimaryLayerId = 'default-layer-vehicles-regular';
export const MapViewStyleVehiclesInteractiveLayerId = 'default-layer-vehicles-regular';

/* * */

interface MapViewOverlayVehiclesProps {
	presentBeforeId?: string
	showCounter?: 'always' | 'positive'
	vehiclesData?: GeoJSON.FeatureCollection<GeoJSON.Geometry, GeoJSON.GeoJsonProperties>
	visible?: boolean
}

/* * */

const baseGeoJsonFeatureCollection = getBaseGeoJsonFeatureCollection();

const ANIMATION_DURATION = 800; // ms

function ease(t: number): number {
	return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
}

function interpolateCoords(start: number[], end: number[], t: number): number[] {
	return [
		start[0] + (end[0] - start[0]) * t,
		start[1] + (end[1] - start[1]) * t,
	];
}

function interpolateAngle(start: number, end: number, t: number): number {
	const delta = ((((end - start) % 360) + 540) % 360) - 180;
	return start + delta * t;
}

function parseBearing(value: unknown): null | number {
	if (typeof value === 'number' && Number.isFinite(value)) return value;
	if (typeof value === 'string') {
		const parsed = Number(value);
		if (Number.isFinite(parsed)) return parsed;
	}
	return null;
}

function getDeterministicBearing(feature: GeoJSON.Feature<GeoJSON.Point>): number {
	const idPart = feature.id != null ? String(feature.id) : '';
	const [lng, lat] = feature.geometry.coordinates;
	const seed = `${idPart}:${lng.toFixed(6)}:${lat.toFixed(6)}`;

	let hash = 0;
	for (let i = 0; i < seed.length; i++) {
		hash = ((hash << 5) - hash) + seed.charCodeAt(i);
		hash |= 0;
	}

	return ((hash % 360) + 360) % 360;
}

function interpolateProps(startFeature: GeoJSON.Feature<GeoJSON.Point> | undefined, endFeature: GeoJSON.Feature<GeoJSON.Point>, t: number): GeoJSON.Feature {
	const endCoords = endFeature.geometry.coordinates;

	const startCoords = startFeature
		? (startFeature.geometry as GeoJSON.Point).coordinates
		: endCoords;

	const interpolatedCoords = interpolateCoords(startCoords, endCoords, t);

	const startBearingValue = parseBearing(startFeature?.properties?.bearing);
	const endBearingValue = parseBearing(endFeature.properties?.bearing);
	const fallbackBearing = getDeterministicBearing(endFeature);

	const startBearing = startBearingValue ?? endBearingValue ?? fallbackBearing;
	const endBearing = endBearingValue ?? startBearingValue ?? fallbackBearing;
	const interpolatedBearing = interpolateAngle(startBearing, endBearing, t);

	const endDelay = endFeature.properties?.delay ?? 0;
	const startDelay = startFeature?.properties?.delay ?? endDelay;
	const interpolatedDelay = startDelay + (endDelay - startDelay) * t;

	// Fade in new features
	const interpolatedOpacity = startFeature ? 1 : t;

	return {
		...endFeature,
		geometry: {
			...endFeature.geometry,
			coordinates: interpolatedCoords,
		},
		properties: {
			...endFeature.properties,
			bearing: interpolatedBearing,
			delay: interpolatedDelay,
			opacity: interpolatedOpacity,
		},
	};
}

/* * */

export function MapViewOverlayVehicles({ presentBeforeId, showCounter, vehiclesData = baseGeoJsonFeatureCollection, visible = true }: MapViewOverlayVehiclesProps) {
	//

	//
	// A. Setup variables

	const { t } = useTranslation();

	const [animatedData, setAnimatedData] = useState(vehiclesData);
	const previousDataRef = useRef<GeoJSON.FeatureCollection>(vehiclesData);
	const animationStart = useRef<null | number>(null);
	const animationFrame = useRef<null | number>(null);

	//
	// B. Transform data

	useEffect(() => {
		if (!vehiclesData || vehiclesData.features.length === 0) {
			setAnimatedData(vehiclesData);
			previousDataRef.current = vehiclesData;
			return;
		}

		const startMap = new Map<number | string, GeoJSON.Feature>();
		for (const f of previousDataRef.current.features) {
			if (f.id != null) startMap.set(f.id, f);
		}

		const animate = (timestamp: number) => {
			if (!animationStart.current) animationStart.current = timestamp;
			const elapsed = timestamp - animationStart.current;
			const progress = Math.min(elapsed / ANIMATION_DURATION, 1);
			const easedProgress = ease(progress);

			const interpolatedFeatures = vehiclesData.features.map((endFeature) => {
				const id = endFeature.id;
				const startFeature = id != null ? startMap.get(id) as GeoJSON.Feature<GeoJSON.Point> : undefined;
				return interpolateProps(startFeature, endFeature as GeoJSON.Feature<GeoJSON.Point>, easedProgress);
			});

			setAnimatedData({
				...vehiclesData,
				features: interpolatedFeatures as GeoJSON.Feature<GeoJSON.Point>[],
			});

			if (progress < 1) {
				animationFrame.current = requestAnimationFrame(animate);
			} else {
				previousDataRef.current = vehiclesData;
				animationStart.current = null;
			}
		};

		if (animationFrame.current !== null) {
			cancelAnimationFrame(animationFrame.current);
		}
		animationFrame.current = requestAnimationFrame(animate);

		return () => {
			if (animationFrame.current !== null) {
				cancelAnimationFrame(animationFrame.current);
			}
		};
	}, [vehiclesData]);

	//
	// B. Render components

	return (
		<>

			<Source data={animatedData} generateId={true} id="default-source-vehicles" type="geojson">

				<Layer
					beforeId={presentBeforeId}
					id="default-layer-vehicles-delay"
					source="default-source-vehicles"
					type="symbol"
					layout={{
						'icon-allow-overlap': true,
						'icon-anchor': 'center',
						'icon-ignore-placement': true,
						'icon-image': 'cmet-bus-delay',
						'icon-offset': [0, 0],
						'icon-rotate': ['get', 'bearing'],
						'icon-rotation-alignment': 'map',
						'icon-size': ['interpolate',
							['linear'],
							['zoom'],
							10,
							0.05,
							20,
							0.15,
						],
						'symbol-placement': 'point',
						'visibility': visible ? 'visible' : 'none',
					}}
					paint={{
						'icon-opacity': [
							'interpolate',
							['linear'],
							['get',
								'delay'],
							20,
							0,
							40,
							1,
						],
					}}
				/>

				<Layer
					beforeId="default-layer-vehicles-delay"
					id="default-layer-vehicles-regular"
					source="default-source-vehicles"
					type="symbol"
					layout={{
						'icon-allow-overlap': true,
						'icon-anchor': 'center',
						'icon-ignore-placement': true,
						'icon-image': [
							'match',
							['to-string', ['get', 'agency_id']],
							'1', 'ccfl-vehicle-default-light',
							'3', 'cp-vehicle-default-light',
							'4', 'ttsl-vehicle-default-light',
							'8', 'tcb-vehicle-default-light',
							'15', 'fertagus-vehicle-default-light',
							'16', 'mts-vehicle-default-light',
							'21', 'mobi-vehicle-default-light',
							'41', 'cmet-vehicle-default-light',
							'42', 'cmet-vehicle-default-light',
							'43', 'cmet-vehicle-default-light',
							'44', 'cmet-vehicle-default-light',
							'cmet-vehicle-default-light',
						],
						'icon-offset': [0, 0],
						'icon-rotate': ['get', 'bearing'],
						'icon-rotation-alignment': 'map',
						'icon-size': [
							'interpolate',
							['linear'],
							['zoom'],
							10,
							0.05,
							30,
							0.5,
						],
						'symbol-placement': 'point',
						'visibility': visible ? 'visible' : 'none',
					}}
					paint={{
						'icon-opacity': ['get', 'opacity'],
					}}
				/>

			</Source>

			{showCounter === 'always' && (
				<div className={`${styles.vehiclesCounter} ${vehiclesData.features.length === 0 && styles.zeroCount}`}>
					<LiveIcon className={styles.vehiclesCounterIcon} color={!vehiclesData.features.length && 'var(--color-system-text-300)'} />
					{t('default:map.MapViewStyleVehicles.vehicles_counter', '', { count: vehiclesData.features.length })}
				</div>
			)}

			{showCounter === 'positive' && vehiclesData.features.length > 0 && (
				<div className={styles.vehiclesCounter}>
					<LiveIcon />
					{t('default:map.MapViewStyleVehicles.vehicles_counter', '', { count: vehiclesData.features.length })}
				</div>
			)}

		</>
	);

	//
}
