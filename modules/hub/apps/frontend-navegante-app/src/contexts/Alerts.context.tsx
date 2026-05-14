'use client';

import { getPublicVariable } from '@/settings/public-variables';
import { getBaseGeoJsonFeatureCollection } from '@/utils/map.utils';
import { type Alert } from '@tmlmobilidade/go-hub-pckg-types';
import { createContext, useContext, useEffect, useState } from 'react';
import useSWR from 'swr';

/* * */

interface AlertsContextState {
	actions: {
		getAlertById: (alertId: string) => Alert | null
		getAlertsByLineId: (lineId: string) => Alert[]
		getAlertsByStopId: (stopId: string) => Alert[]
	}
	data: {
		alerts: Alert[]
		featureCollection: GeoJSON.FeatureCollection<GeoJSON.Point, GeoJSON.GeoJsonProperties>
	}
	flags: {
		is_loading: boolean
	}
}

/* * */

const AlertsContext = createContext<AlertsContextState | undefined>(undefined);

export function useAlertsContext() {
	const context = useContext(AlertsContext);
	if (!context) {
		throw new Error('useAlertsContext must be used within a AlertsContextProvider');
	}
	return context;
}

/* * */

export const AlertsContextProvider = ({ children }) => {
	//

	//
	// A. Setup variables

	// const analyticsContext = useAnalyticsContext();

	const [alertsState, setAlertsState] = useState<Alert[]>([]);
	const [dataFeatureCollectionState, setDataFeatureCollectionState] = useState<GeoJSON.FeatureCollection<GeoJSON.Point, GeoJSON.GeoJsonProperties>>(getBaseGeoJsonFeatureCollection());
	//
	const { data: alertsResponse, isLoading: allAlertsLoading } = useSWR<{ data: Alert[] }, Error>(`${getPublicVariable('hub_api_url')}/v1/alerts`, { refreshInterval: 180000 }); // 3 minutes

	//
	// C. Transform data

	useEffect(() => {
		if (!alertsResponse || allAlertsLoading) return;
		const list = alertsResponse.data ?? [];
		setAlertsState(list);
	}, [alertsResponse, allAlertsLoading]);

	// Transform data into geojson
	useEffect(() => {
		const collection = getBaseGeoJsonFeatureCollection();
		let withCoordinates = 0;
		let withoutCoordinates = 0;
		alertsState.forEach((alert) => {
			if (Array.isArray(alert.coordinates) && alert.coordinates.length === 2) withCoordinates++;
			else withoutCoordinates++;
			const alertFC = transformAlertDataIntoGeoJsonFeature(alert);
			if (alertFC) collection.features.push(alertFC);
		});

		setDataFeatureCollectionState(collection);
	}, [alertsState]);

	//
	// D. Handle actions

	const getAlertById = (alertId: string): Alert | null => {
		return alertsState.find(item => item.alert_id === alertId) || null;
	};

	const getAlertsByLineId = (lineId: string): Alert[] => {
		return alertsState.filter((resolvedAlert) => {
			return resolvedAlert.informed_entity.some((informedEntity) => {
				if (informedEntity.line_id != null && String(informedEntity.line_id) === String(lineId)) return true;
				return informedEntity.route_id?.startsWith(lineId) ?? false;
			});
		});
	};

	const getAlertsByStopId = (stopId: string): Alert[] => {
		return alertsState.filter(resolvedAlert => resolvedAlert.informed_entity.some(informedEntity => informedEntity.stop_id === stopId));
	};

	//
	// E. Define context value

	const contextValue: AlertsContextState = {
		actions: {
			getAlertById,
			getAlertsByLineId,
			getAlertsByStopId,
		},
		data: {
			alerts: alertsState,
			featureCollection: dataFeatureCollectionState,
		},
		flags: {
			is_loading: allAlertsLoading,
		},
	};

	//
	// F. Render components

	return (
		<AlertsContext.Provider value={contextValue}>
			{children}
		</AlertsContext.Provider>
	);

	//
};

/* * */

export function transformAlertDataIntoGeoJsonFeature(alertData: Alert): GeoJSON.Feature<GeoJSON.Point, GeoJSON.GeoJsonProperties> {
	if (!alertData.coordinates) return null;
	return {
		geometry: {
			coordinates: [alertData.coordinates[1], alertData.coordinates[0]],
			type: 'Point',
		},
		properties: {
			cause: alertData.cause,
			effect: alertData.effect,
			id: alertData.alert_id,
		},
		type: 'Feature',
	};
}
