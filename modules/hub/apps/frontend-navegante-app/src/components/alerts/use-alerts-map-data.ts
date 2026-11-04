'use client';

import { useAlertsData } from '@/components/alerts/use-alerts-data';
import { getBaseGeoJsonFeatureCollection } from '@tmlmobilidade/geo';
import { type HubV1ApiAlert } from '@tmlmobilidade/go-types-hub';
import { type UnixMilliseconds } from '@tmlmobilidade/go-types-shared';
import { useMemo } from 'react';

/* * */

interface UseAlertsMapDataReturnType {
	data: GeoJSON.FeatureCollection<GeoJSON.Geometry, GeoJSON.GeoJsonProperties>
	entities: HubV1ApiAlert[]
	error: null | string
	isLoading: boolean
	isValidating: boolean
	mutate: () => void
	timestamp: null | UnixMilliseconds
}

/* * */

function buildAlertsFeatureCollection(alerts: HubV1ApiAlert[]): GeoJSON.FeatureCollection<GeoJSON.Geometry, GeoJSON.GeoJsonProperties> {
	const collection = getBaseGeoJsonFeatureCollection();

	for (const alert of alerts) {
		const feature = transformAlertDataIntoGeoJsonFeature(alert);
		if (feature) collection.features.push(feature);
	}

	return collection;
}

function transformAlertDataIntoGeoJsonFeature(alert: HubV1ApiAlert): GeoJSON.Feature<GeoJSON.Point, GeoJSON.GeoJsonProperties> | null {
	if (!alert.coordinates?.length) return null;

	return {
		geometry: {
			coordinates: [alert.coordinates[1], alert.coordinates[0]],
			type: 'Point',
		},
		properties: {
			_id: alert._id,
			cause: alert.cause,
			description: alert.description,
			effect: alert.effect,
			id: alert._id,
			title: alert.title,
		},
		type: 'Feature',
	};
}

/* * */

export function useAlertsMapData(): UseAlertsMapDataReturnType {
	//

	//
	// A. Setup variables

	const { data: alerts, error, isLoading, isValidating, mutate, timestamp } = useAlertsData();

	//
	// B. Transform data

	const data = useMemo(() => buildAlertsFeatureCollection(alerts), [alerts]);

	//
	// C. Return data

	return useMemo(() => ({
		data,
		entities: alerts,
		error,
		isLoading,
		isValidating,
		mutate,
		timestamp,
	}), [alerts, data, error, isLoading, isValidating, mutate, timestamp]);

	//
}
