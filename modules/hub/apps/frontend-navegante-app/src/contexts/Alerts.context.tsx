'use client';

import { getPublicVariable } from '@/settings/public-variables';
import convertToSimplifiedAlert from '@/utils/convertToSimplifiedAlert';
import { getBaseGeoJsonFeatureCollection } from '@/utils/map.utils';
import { type Alert, type SimplifiedAlert } from '@tmlmobilidade/go-hub-pckg-types';
import { useLocale } from 'next-intl';
import { createContext, useContext, useEffect, useState } from 'react';
import useSWR from 'swr';

// import { useAnalyticsContext } from './Analytics.context';

/* * */

interface AlertsContextState {
	actions: {
		getAlertById: (alertId: string) => null | SimplifiedAlert
		getAlertsByLineId: (lineId: string) => SimplifiedAlert[]
		getAlertsByStopId: (stopId: string) => SimplifiedAlert[]
	}
	data: {
		alerts: SimplifiedAlert[]
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

	const currentLocale = useLocale();
	// const analyticsContext = useAnalyticsContext();

	const [alertsState, setAlertsState] = useState<SimplifiedAlert[]>([]);
	const [dataFeatureCollectionState, setDataFeatureCollectionState] = useState<GeoJSON.FeatureCollection<GeoJSON.Point, GeoJSON.GeoJsonProperties>>(getBaseGeoJsonFeatureCollection());
	//
	const { data: alertsResponse, isLoading: allAlertsLoading } = useSWR<{ data: Alert[] }, Error>(`${getPublicVariable('hub_api_url')}/v1/alerts`, { refreshInterval: 180000 }); // 3 minutes

	//
	// C. Transform data

	useEffect(() => {
		if (!alertsResponse || allAlertsLoading) return;
		const list = alertsResponse.data ?? [];
		setAlertsState(list.map(alert => convertToSimplifiedAlert(alert, currentLocale)));
	}, [alertsResponse, allAlertsLoading, currentLocale]);

	// Transform data into geojson
	useEffect(() => {
		const collection = getBaseGeoJsonFeatureCollection();
		alertsState.forEach((alert) => {
			const alertFC = transformAlertDataIntoGeoJsonFeature(alert);
			if (alertFC) collection.features.push(alertFC);
		});

		setDataFeatureCollectionState(collection);
	}, [alertsState]);

	//
	// D. Handle actions

	const getAlertById = (alertId: string): null | SimplifiedAlert => {
		return alertsState.find(item => item.alert_id.toLowerCase() === alertId.toLowerCase()) || null;
	};

	const getAlertsByLineId = (lineId: string): SimplifiedAlert[] => {
		// TODO: Update this to use informed_entity.lineId instead of routeId
		// This is a temporary solution to filter by lineId until the API is updated
		return alertsState.filter((resolvedAlert) => {
			// Include this element if any informed_entity...
			return resolvedAlert.informed_entity.some((informedEntity) => {
				// ...has a routeId that starts with the lineId
				return informedEntity.route_id?.startsWith(lineId);
			});
		});
	};

	const getAlertsByStopId = (stopId: string): SimplifiedAlert[] => {
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

export function transformAlertDataIntoGeoJsonFeature(alertData: SimplifiedAlert): GeoJSON.Feature<GeoJSON.Point, GeoJSON.GeoJsonProperties> {
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
