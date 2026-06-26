'use client';

import { getBaseGeoJsonFeatureCollection } from '@tmlmobilidade/geo';
import { Layer, Source } from '@vis.gl/react-maplibre';
import { type DataDrivenPropertyValueSpecification } from 'maplibre-gl';
import { useEffect, useRef, useState } from 'react';

import styles from './styles.module.css';

import { Indicator } from '../../../display/Indicator';

/* * */

export const MapOverlayVehiclesPrimaryLayerId = 'default-layer-vehicles-regular';
export const MapOverlayVehiclesInteractiveLayerId = 'default-layer-vehicles-regular';

/* * */

interface Props {
	display?: 'ambient' | 'default'
	presentBeforeId?: string
	showCounter?: 'always' | 'positive'
	vehiclesData?: GeoJSON.FeatureCollection<GeoJSON.Point>
}

/* * */

const baseGeoJsonFeatureCollection = getBaseGeoJsonFeatureCollection<GeoJSON.Point, unknown>();

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
	const featureId = endFeature.id != null ? String(endFeature.id) : '';

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
			feature_id: featureId,
			opacity: interpolatedOpacity,
		},
	};
}

interface VehicleIconSize {
	zoom10: number
	zoom20: number
}

const DEFAULT_VEHICLE_ICON_SIZE: VehicleIconSize = {
	zoom10: 0.09,
	zoom20: 0.26,
};

const AMBIENT_VEHICLE_ICON_SIZE: VehicleIconSize = {
	zoom10: 0.07,
	zoom20: 0.20,
};

const VEHICLE_ICON_SIZE_BY_AGENCY: Array<{
	agencyIds: readonly number[]
	size: VehicleIconSize
}> = [
	{
		agencyIds: [1],
		size: { zoom10: 0.085, zoom20: 0.24 },
	},
	{
		agencyIds: [21],
		size: { zoom10: 0.085, zoom20: 0.24 },
	},
];

const AGENCY_ID_INPUT = ['to-string', ['get', 'agency_id']];

function buildAgencyMatch<T extends number | string>(
	entries: ReadonlyArray<{ agencyIds: readonly number[], value: T }>,
	defaultValue: T,
) {
	const cases: (number | string | T)[] = [];

	for (const { agencyIds, value } of entries) {
		for (const agencyId of agencyIds) {
			cases.push(String(agencyId), value);
		}
	}

	return ['match', AGENCY_ID_INPUT, ...cases, defaultValue];
}

function buildVehicleIconSizeExpression(display: 'ambient' | 'default') {
	const baseSize = display === 'ambient'
		? AMBIENT_VEHICLE_ICON_SIZE
		: DEFAULT_VEHICLE_ICON_SIZE;

	const zoom10Cases = VEHICLE_ICON_SIZE_BY_AGENCY.map(({ agencyIds, size }) => ({
		agencyIds,
		value: display === 'ambient' ? size.zoom10 * 0.78 : size.zoom10,
	}));

	const zoom20Cases = VEHICLE_ICON_SIZE_BY_AGENCY.map(({ agencyIds, size }) => ({
		agencyIds,
		value: display === 'ambient' ? size.zoom20 * 0.78 : size.zoom20,
	}));

	return [
		'interpolate',
		['linear'],
		['zoom'],
		10,
		buildAgencyMatch(zoom10Cases, baseSize.zoom10),
		16,
		display === 'ambient' ? 0.14 : 0.19,
		20,
		buildAgencyMatch(zoom20Cases, baseSize.zoom20),
	] as unknown as DataDrivenPropertyValueSpecification<number>;
}

/* * */

export function MapOverlayVehicles({ display = 'default', presentBeforeId, showCounter, vehiclesData = baseGeoJsonFeatureCollection }: Props) {
	//

	//
	// A. Setup variables

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
				return interpolateProps(startFeature, endFeature, easedProgress);
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
							'1', 'map-vehicle-ccfl-bus',
							'2', 'map-vehicle-ml-train',
							'3', 'map-vehicle-cp-train',
							'4', 'map-vehicle-ttsl-boat',
							'8', 'map-vehicle-tcb-bus',
							'15', 'map-vehicle-fertagus-train',
							'16', 'map-vehicle-mts-tram',
							'21', 'map-vehicle-mobi-bus',
							'41', 'map-vehicle-cmet-bus',
							'42', 'map-vehicle-cmet-bus',
							'43', 'map-vehicle-cmet-bus',
							'44', 'map-vehicle-cmet-bus',
							'map-vehicle-cmet-bus',
						],
						'icon-offset': [0, 0],
						'icon-rotate': ['get', 'bearing'],
						'icon-rotation-alignment': 'map',
						'icon-size': buildVehicleIconSizeExpression(display),
						'symbol-placement': 'point',
					}}
					paint={{
						'icon-opacity': display === 'ambient'
							? ['get', 'opacity']
							: [
								'interpolate',
								['linear'],
								['zoom'],
								12,
								0,
								13,
								['get', 'opacity'],
							],
					}}
				/>

				{display === 'default' && (
					<Layer
						beforeId="default-layer-vehicles-regular"
						id="default-layer-vehicles-dot"
						source="default-source-vehicles"
						type="circle"
						paint={{
							'circle-color': '#00CD32',
							'circle-opacity': [
								'interpolate',
								['linear'],
								['zoom'],
								12,
								['get', 'opacity'],
								13,
								0,
							],
							'circle-pitch-alignment': 'map',
							'circle-radius': 1.8,
						}}
					/>
				)}

			</Source>

			{showCounter === 'always' && (
				<div className={`${styles.vehiclesCounter} ${vehiclesData.features.length === 0 && styles.zeroCount}`}>
					<Indicator />
					{vehiclesData.features.length} veículos em movimento
				</div>
			)}

			{showCounter === 'positive' && vehiclesData.features.length > 0 && (
				<div className={styles.vehiclesCounter}>
					<Indicator />
					{vehiclesData.features.length} veículos em movimento
				</div>
			)}

		</>
	);

	//
}
