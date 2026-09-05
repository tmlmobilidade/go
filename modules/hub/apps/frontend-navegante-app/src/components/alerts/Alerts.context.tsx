'use client';

import { API_ROUTES } from '@tmlmobilidade/consts';
import { getBaseGeoJsonFeatureCollection } from '@tmlmobilidade/geo';
import { type HubV1ApiAlert } from '@tmlmobilidade/go-types-hub';
import { fetchApiData } from '@tmlmobilidade/ui';
import { createContext, type PropsWithChildren, useContext, useMemo } from 'react';
import useSWR from 'swr';

/* * */

interface AlertsContextState {
	actions: {
		getAlertById: (alertId: string) => HubV1ApiAlert | null
		getAlertsByLineId: (lineId: string) => HubV1ApiAlert[]
		getAlertsByStopId: (stopId: string) => HubV1ApiAlert[]
	}
	data: {
		alerts: HubV1ApiAlert[]
		fc: GeoJSON.FeatureCollection<GeoJSON.Geometry, GeoJSON.GeoJsonProperties>
	}
	flags: {
		error: Error | undefined
		isLoading: boolean
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

export function AlertsContextProvider({ children }: PropsWithChildren) {
	//

	//
	// A. Fetch data

	const { data: allAlertsData, isLoading: allAlertsLoading } = useSWR(API_ROUTES.hub.ALERTS_LIST, {
		fetcher: async (url: string) => await fetchApiData<HubV1ApiAlert[]>({ credentials: 'omit', url }),
	});

	//
	// B. Transform data

	const dataFeatureCollectionState = useMemo(() => {
		const collection = getBaseGeoJsonFeatureCollection();
		if (!allAlertsData) return collection;
		allAlertsData.data?.forEach((item) => {
			const alertFC = transformAlertDataIntoGeoJsonFeature(item);
			if (alertFC) collection.features.push(alertFC);
		});
		return collection;
	}, [allAlertsData]);

	//
	// C. Handle actions

	const getAlertById = (alertId: string): HubV1ApiAlert | null => {
		return allAlertsData?.data?.find(item => item._id === alertId) || null;
	};

	const getAlertsByLineId = (lineId: string): HubV1ApiAlert[] => {
		return allAlertsData?.data?.filter((item) => {
			if (item.reference_type === 'lines') return item.references.some(reference => reference.parent_id === lineId);
			if (item.reference_type === 'stops') return item.references.some(reference => reference.child_ids.includes(lineId));
			return false;
		}) || [];
	};

	const getAlertsByStopId = (lineId: string): HubV1ApiAlert[] => {
		return allAlertsData?.data?.filter((item) => {
			if (item.reference_type === 'stops') return item.references.some(reference => reference.parent_id === lineId);
			if (item.reference_type === 'lines') return item.references.some(reference => reference.child_ids.includes(lineId));
			return false;
		}) || [];
	};

	//
	// D. Define context value

	const contextValue: AlertsContextState = {
		actions: {
			getAlertById,
			getAlertsByLineId,
			getAlertsByStopId,
		},
		data: {
			alerts: allAlertsData?.data || [],
			fc: dataFeatureCollectionState,
		},
		flags: {
			error: undefined,
			isLoading: allAlertsLoading,
		},
	};

	//
	// E. Render components

	return (
		<AlertsContext.Provider value={contextValue}>
			{children}
		</AlertsContext.Provider>
	);
};

/* * */

export function transformAlertDataIntoGeoJsonFeature(alertData: HubV1ApiAlert): GeoJSON.Feature<GeoJSON.Point, GeoJSON.GeoJsonProperties> {
	// Skip alerts without coordinates
	if (!alertData.coordinates?.length) return null;
	// Transform alert data into a GeoJSON feature
	return {
		geometry: {
			coordinates: [alertData.coordinates[1], alertData.coordinates[0]],
			type: 'Point',
		},
		properties: {
			_id: alertData._id,
			cause: alertData.cause,
			description: alertData.description,
			effect: alertData.effect,
			id: alertData._id,
			title: alertData.title,
		},
		type: 'Feature',
	};
}
