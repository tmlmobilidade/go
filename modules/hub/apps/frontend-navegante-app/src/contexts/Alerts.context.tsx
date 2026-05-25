'use client';

import { getPublicVariable } from '@/settings/public-variables';
import { getBaseGeoJsonFeatureCollection } from '@/utils/map.utils';
import { Dates } from '@tmlmobilidade/dates';
import { type Alert, type SimplifiedAlert } from '@tmlmobilidade/go-hub-pckg-types';
import { convertToSimplifiedAlert } from '@tmlmobilidade/go-hub-pckg-utils';
import { useLocale } from 'next-intl';
import { createContext, useContext, useMemo } from 'react';
import useSWR from 'swr';

import { agencyMatchesSelection, agencyMatchesTransports, transportsSelectionIsAll, useGlobalSettingsContext } from './GlobalSettings.context';

/* * */

interface AlertsContextState {
	actions: {
		getAlertById: (alertId: string) => null | SimplifiedAlert
		getAlertsByLineId: (lineId: string) => SimplifiedAlert[]
		getAlertsByStopId: (stopId: string) => SimplifiedAlert[]
		isAlertActiveNow: (alert: SimplifiedAlert) => boolean
		isAlertInThisWeek: (alert: SimplifiedAlert) => boolean
		isAlertStartingAfterThisWeek: (alert: SimplifiedAlert) => boolean
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

	const locale = useLocale();
	const globalSettingsContext = useGlobalSettingsContext();
	const filterByAgency = globalSettingsContext.filterbar.by_agency;
	const filterByTransports = globalSettingsContext.filterbar.transports;

	const { data: alertsResponse, isLoading: allAlertsLoading } = useSWR<{ data: Alert[] }, Error>(`${getPublicVariable('hub_api_url')}/v1/alerts`, { refreshInterval: 180000 }); // 3 minutes

	//
	// C. Transform data

	const alertsState = useMemo(() => {
		const alerts = alertsResponse?.data ?? [];
		return alerts
			.map(alert => convertToSimplifiedAlert(alert, locale))
			.filter((alert): alert is SimplifiedAlert => alert !== null);
	}, [alertsResponse, locale]);

	const filteredAlertsState = useMemo(() => {
		const isAllAgencies = filterByAgency.length === 0;
		const isAllTransports = transportsSelectionIsAll(filterByTransports);

		if (isAllAgencies && isAllTransports) return alertsState;

		return alertsState.filter((alert) => {
			return alert.informed_entity.some((entity) => {
				if (!entity.agency_id) return false;
				if (!isAllAgencies && !agencyMatchesSelection(entity.agency_id, filterByAgency)) return false;
				if (!isAllTransports && !agencyMatchesTransports(entity.agency_id, filterByTransports)) return false;
				return true;
			});
		});
	}, [alertsState, filterByAgency, filterByTransports]);

	const dataFeatureCollectionState = useMemo(() => {
		const collection = getBaseGeoJsonFeatureCollection();
		filteredAlertsState.forEach((alert) => {
			const alertFC = transformAlertDataIntoGeoJsonFeature(alert);
			if (alertFC) collection.features.push(alertFC);
		});

		return collection;
	}, [filteredAlertsState]);

	//
	// D. Handle actions

	const getAlertById = (alertId: string): null | SimplifiedAlert => {
		return filteredAlertsState.find(item => item.alert_id === alertId) || null;
	};

	const getAlertsByLineId = (lineId: string): SimplifiedAlert[] => {
		return filteredAlertsState.filter((resolvedAlert) => {
			return resolvedAlert.informed_entity.some((informedEntity) => {
				if (informedEntity.line_id != null && String(informedEntity.line_id) === String(lineId)) return true;
				return informedEntity.route_id?.startsWith(lineId) ?? false;
			});
		});
	};

	const getAlertsByStopId = (stopId: string): SimplifiedAlert[] => {
		return filteredAlertsState.filter(resolvedAlert => resolvedAlert.informed_entity.some(informedEntity => informedEntity.stop_id === stopId));
	};

	const isAlertActiveNow = (alert: SimplifiedAlert): boolean => {
		if (!alert.end_date) return true;
		return !Number.isNaN(alert.end_date.getTime()) && alert.end_date.getTime() >= Date.now();
	};

	const isAlertInThisWeek = (alert: SimplifiedAlert): boolean => {
		const startTime = alert.start_date.getTime();
		if (Number.isNaN(startTime)) return false;
		const nowMs = Date.now();

		const now = Dates.now('local');
		const weekWindowStart = now.startOf('day').unix_timestamp;
		const weekWindowEnd = now.plus({ weeks: 1 }).endOf('day').unix_timestamp;
		const endTime = alert.end_date?.getTime();

		return startTime <= nowMs && startTime <= weekWindowEnd && (typeof endTime !== 'number' || endTime >= weekWindowStart);
	};

	const isAlertStartingAfterThisWeek = (alert: SimplifiedAlert): boolean => {
		const startTime = alert.start_date.getTime();
		if (Number.isNaN(startTime)) return false;
		return startTime > Date.now();
	};

	//
	// E. Define context value

	const contextValue: AlertsContextState = {
		actions: {
			getAlertById,
			getAlertsByLineId,
			getAlertsByStopId,
			isAlertActiveNow,
			isAlertInThisWeek,
			isAlertStartingAfterThisWeek,
		},
		data: {
			alerts: filteredAlertsState,
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
