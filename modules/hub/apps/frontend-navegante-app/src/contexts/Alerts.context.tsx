'use client';

import { API_ROUTES } from '@tmlmobilidade/consts';
import { getBaseGeoJsonFeatureCollection } from '@tmlmobilidade/geo';
import { type Alert } from '@tmlmobilidade/types';
import { createContext, type PropsWithChildren, useContext, useMemo } from 'react';
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
		fc: GeoJSON.FeatureCollection<GeoJSON.Geometry, GeoJSON.GeoJsonProperties>
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

export function AlertsContextProvider({ children }: PropsWithChildren) {
	//

	//
	// A. Fetch data

	const { data: allAlertsData, isLoading: allAlertsLoading } = useSWR<Alert[]>({ credentials: 'omit', url: API_ROUTES.hub.ALERTS_LIST });

	//
	// B. Transform data

	const dataFeatureCollectionState = useMemo(() => {
		const collection = getBaseGeoJsonFeatureCollection();
		if (!allAlertsData) return collection;
		allAlertsData.forEach((item) => {
			const alertFC = transformAlertDataIntoGeoJsonFeature(item);
			if (alertFC) collection.features.push(alertFC);
		});
		return collection;
	}, [allAlertsData]);

	//
	// C. Handle actions

	const getAlertById = (alertId: string): Alert | null => {
		return allAlertsData?.find(item => item._id === alertId) || null;
	};

	const getAlertsByLineId = (lineId: string): Alert[] => {
		return allAlertsData?.filter((item) => {
			if (item.reference_type === 'lines') return item.references.some(reference => reference.parent_id === lineId);
			if (item.reference_type === 'stops') return item.references.some(reference => reference.child_ids.includes(lineId));
			return false;
		}) || [];
	};

	const getAlertsByStopId = (lineId: string): Alert[] => {
		return allAlertsData?.filter((item) => {
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
			alerts: allAlertsData || [],
			fc: dataFeatureCollectionState,
		},
		flags: {
			is_loading: allAlertsLoading,
		},
	};

	//
	// E. Render components

	return (
		<AlertsContext.Provider value={contextValue}>
			{children}
		</AlertsContext.Provider>
	);

	//
};

/* * */

export function transformAlertDataIntoGeoJsonFeature(alertData: Alert): GeoJSON.Feature<GeoJSON.Point, GeoJSON.GeoJsonProperties> {
	// Skip alerts without coordinates
	if (!alertData.coordinates?.length) return null;
	// Transform alert data into a GeoJSON feature
	return {
		geometry: {
			coordinates: [alertData.coordinates[1], alertData.coordinates[0]],
			type: 'Point',
		},
		properties: {
			cause: alertData.cause,
			description: alertData.description,
			effect: alertData.effect,
			id: alertData._id,
			title: alertData.title,
		},
		type: 'Feature',
	};
}
