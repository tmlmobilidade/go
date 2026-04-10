'use client';

/* * */

import { useRideFavoritesContext } from '@/contexts/RideFavorites.context';
import { useDebouncedValue } from '@mantine/hooks';
import { API_ROUTES } from '@tmlmobilidade/consts';
import { Dates } from '@tmlmobilidade/dates';
import { type OperationalStatus, PermissionCatalog, type RideNormalized, RideNormalizedSchema } from '@tmlmobilidade/types';
import { DelayStatusSchema, OperationalStatusSchema } from '@tmlmobilidade/types';
import { RIDE_ANALYSIS_GRADE_OPTIONS, type UnixTimestamp } from '@tmlmobilidade/types';
import { useDataAgencies, useDataRides, useFilterStateList, type UseFilterStateListReturnType, useFilterStateString, type UseFilterStateStringReturnType } from '@tmlmobilidade/ui';
import { parseAsInteger, useQueryState } from 'nuqs';
import { createContext, type PropsWithChildren, useContext, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

/* * */

export interface RidesListContextState {
	actions: {
		setFavoritesEnabled: () => void
		setFilterDateEnd: (value: number) => void
		setFilterDateStart: (value: number) => void
	}
	data: {
		filtered: RideNormalized[]
		filteredByFavoriteIds: RideNormalized[]
	}
	filters: {
		acceptance_status: UseFilterStateListReturnType<RideNormalized['acceptance_status']>
		agency: UseFilterStateListReturnType
		analysis_ended_at_last_stop: UseFilterStateListReturnType
		analysis_expected_apex_validation_interval: UseFilterStateListReturnType
		analysis_simple_three_vehicle_events_grade: UseFilterStateListReturnType
		analysis_transaction_sequentiality: UseFilterStateListReturnType
		date_end: number
		date_start: number
		delay_status: UseFilterStateListReturnType<RideNormalized['delay_status']>
		operational_status: UseFilterStateListReturnType<OperationalStatus>
		search: UseFilterStateStringReturnType
	}
	flags: {
		error: Error | null
		favoritesEnabled: boolean
		last_updated_at: null | UnixTimestamp
		loading: boolean
	}
}

/* * */

const RidesListContext = createContext<RidesListContextState | undefined>(undefined);

export function useRidesListContext() {
	const context = useContext(RidesListContext);
	if (!context) {
		throw new Error('useRidesListContext must be used within a RidesListContextProvider');
	}
	return context;
}

/* * */

export const RidesListContextProvider = ({ children }: PropsWithChildren) => {
	//

	//
	// A. Setup variables

	const { t } = useTranslation();
	const rideFavoritesContext = useRideFavoritesContext();

	const [favoritesEnabled, setFavoritesEnabled] = useState<boolean>(false);

	//
	// B. Fetch data

	const { filteredIds: filteredAgencyIds, options: filteredAgencyOptions } = useDataAgencies(API_ROUTES.auth.AGENCIES_LIST, {
		actions: [PermissionCatalog.all.rides.actions.analysis_read],
		scope: PermissionCatalog.all.rides.scope,
	});

	//
	// C. Setup filters

	const filterSearch = useFilterStateString('search');
	const [debouncedFilterSearch] = useDebouncedValue(filterSearch.value.trim(), 500);

	const [filterDateEnd, setFilterDateEnd] = useQueryState<number>('date_end', parseAsInteger.withDefault(useMemo(() => Dates.now('Europe/Lisbon').plus({ minutes: 5 }).unix_timestamp, [])));
	const [filterDateStart, setFilterDateStart] = useQueryState<number>('date_start', parseAsInteger.withDefault(useMemo(() => Dates.now('Europe/Lisbon').minus({ minutes: 5 }).unix_timestamp, [])));

	const filterAgency = useFilterStateList('agency', filteredAgencyIds, filteredAgencyOptions);
	const filterDelayStatus = useFilterStateList('delay_status', DelayStatusSchema.options, DelayStatusSchema.options.map(item => ({ label: t(`shared:status.delay_status.${item}`), value: item })));
	const filterOperationalStatus = useFilterStateList('operational_status', OperationalStatusSchema.options, OperationalStatusSchema.options.map(item => ({ label: t(`shared:status.operational_status.${item}`), value: item })));
	const filterAnalysisSimpleThreeVehicleEvents = useFilterStateList('analysis_simple_three_vehicle_events', [...RIDE_ANALYSIS_GRADE_OPTIONS, 'none'], [...RIDE_ANALYSIS_GRADE_OPTIONS, 'none'].map(item => ({ label: item, value: item })));
	const filterAnalysisEndedAtLastStop = useFilterStateList('analysis_ended_at_last_stop', [...RIDE_ANALYSIS_GRADE_OPTIONS, 'none'], [...RIDE_ANALYSIS_GRADE_OPTIONS, 'none'].map(item => ({ label: item, value: item })));
	const filterAnalysisExpectedApexValidationInterval = useFilterStateList('analysis_expected_apex_validation_interval', [...RIDE_ANALYSIS_GRADE_OPTIONS, 'none'], [...RIDE_ANALYSIS_GRADE_OPTIONS, 'none'].map(item => ({ label: item, value: item })));
	const filterAnalysisTransactionSequentiality = useFilterStateList('analysis_transaction_sequentiality', [...RIDE_ANALYSIS_GRADE_OPTIONS, 'none'], [...RIDE_ANALYSIS_GRADE_OPTIONS, 'none'].map(item => ({ label: item, value: item })));
	const filterAcceptanceStatus = useFilterStateList('acceptance_status', RideNormalizedSchema.shape.acceptance_status.options, RideNormalizedSchema.shape.acceptance_status.options.map(item => ({ label: t(`ride_status:acceptance_status.${item}`), value: item })));

	const { error: ridesError, isLoading: ridesLoading, lastUpdatedAt: ridesLastUpdatedAt, raw: ridesData } = useDataRides(API_ROUTES.controller.RIDES_LIST, {
		filters: {
			agency_ids: filterAgency.value,
			date_end: filterDateEnd as UnixTimestamp,
			date_start: filterDateStart as UnixTimestamp,
			// line_ids: filterLines.value,
			acceptance_status: filterAcceptanceStatus.value,
			analysis_ended_at_last_stop_grade: filterAnalysisEndedAtLastStop.value,
			analysis_expected_apex_validation_interval: filterAnalysisExpectedApexValidationInterval.value,
			analysis_simple_three_vehicle_events_grade: filterAnalysisSimpleThreeVehicleEvents.value,
			analysis_transaction_sequentiality: filterAnalysisTransactionSequentiality.value,
			delay_statuses: filterDelayStatus.value,
			operational_statuses: filterOperationalStatus.value,
			search: debouncedFilterSearch,
			// stop_ids: filterStops.value,
		},
	});

	//
	// D. Define context value

	const contextValue: RidesListContextState = useMemo(() => ({
		actions: {
			setFavoritesEnabled: () => setFavoritesEnabled(!favoritesEnabled),
			setFilterDateEnd,
			setFilterDateStart,
		},
		data: {
			filtered: ridesData ?? [],
			filteredByFavoriteIds: rideFavoritesContext.data.favoriteRides,
		},
		filters: {
			acceptance_status: filterAcceptanceStatus,
			agency: filterAgency,
			analysis_ended_at_last_stop: filterAnalysisEndedAtLastStop,
			analysis_expected_apex_validation_interval: filterAnalysisExpectedApexValidationInterval,
			analysis_simple_three_vehicle_events_grade: filterAnalysisSimpleThreeVehicleEvents,
			analysis_transaction_sequentiality: filterAnalysisTransactionSequentiality,
			date_end: filterDateEnd,
			date_start: filterDateStart,
			delay_status: filterDelayStatus,
			operational_status: filterOperationalStatus,
			search: filterSearch,
		},
		flags: {
			error: ridesError,
			favoritesEnabled,
			last_updated_at: ridesLastUpdatedAt,
			loading: ridesLoading,
		},
	}), [
		ridesData,
		filterAgency,
		filterDateEnd,
		filterDateStart,
		filterDelayStatus,
		filterOperationalStatus,
		filterSearch,
		filterAnalysisSimpleThreeVehicleEvents,
		filterAnalysisTransactionSequentiality,
		filterAnalysisExpectedApexValidationInterval,
		filterAcceptanceStatus,
		filterAnalysisEndedAtLastStop,
		ridesLoading,
		ridesError,
		ridesLastUpdatedAt,
		favoritesEnabled,
		rideFavoritesContext.data.favoriteRides,
		setFilterDateEnd,
		setFilterDateStart,
	]);

	//
	// E. Render components

	return (
		<RidesListContext.Provider value={contextValue}>
			{children}
		</RidesListContext.Provider>
	);

	//
};
