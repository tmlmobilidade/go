'use client';

/* * */

import { useGlobalSettingsContext } from '@/contexts/GlobalSettings.context';
import { transformStopDataIntoGeoJsonFeature, useStopsContext } from '@/contexts/Stops.context';
import { useVehiclesContext } from '@/contexts/Vehicles.context';
import { createDocCollection } from '@/hooks/useOtherSearch';
import { getBaseGeoJsonFeatureCollection } from '@/utils/map.utils';
import { agencyMatchesSelection, agencyMatchesTransports } from '@/utils/transportAgencies';
import { type NetworkStop } from '@carrismetropolitana/navegante-tempo-real-shared-types';
import { createContext, useContext, useEffect, useMemo, useState } from 'react';

/* * */

interface StopsListContextState {
	actions: {
		updateFilterByAttribute: (value: string) => void
		updateFilterByCurrentView: (value: string) => void
		updateFilterByFacility: (value: string) => void
		updateFilterByMunicipalityOrLocality: (value: string) => void
		updateFilterBySearch: (value: string) => void
	}
	data: {
		filtered: NetworkStop[]
		filtered_fc: GeoJSON.FeatureCollection<GeoJSON.Point, GeoJSON.GeoJsonProperties>
	}
	filters: {
		by_attribute: null | string
		by_current_view: 'list' | 'map'
		by_facility: null | string
		by_municipality_or_locality: null | string
		by_search: string
	}
	flags: {
		is_loading: boolean
	}
}

/* * */

const StopsListContext = createContext<StopsListContextState | undefined>(undefined);

export function useStopsListContext() {
	const context = useContext(StopsListContext);
	if (!context) {
		throw new Error('useStopsListContext must be used within a StopsListContextProvider');
	}
	return context;
}

/* * */

export const StopsListContextProvider = ({ children }) => {
	//

	//
	// A. Setup variables

	const stopsContext = useStopsContext();
	const vehiclesContext = useVehiclesContext();
	const globalSettingsContext = useGlobalSettingsContext();

	const lineIdToAgencyIds = useMemo(() => {
		const map = new Map<string, Set<string>>();
		vehiclesContext.data.vehicles.forEach((vehicle) => {
			if (!vehicle.line_id || !vehicle.agency_id) return;
			const existing = map.get(vehicle.line_id);
			if (existing) {
				existing.add(vehicle.agency_id);
			}
			else {
				map.set(vehicle.line_id, new Set([vehicle.agency_id]));
			}
		});
		return map;
	}, [vehiclesContext.data.vehicles]);

	const filterByAgency = globalSettingsContext.filterbar.by_agency;
	const filterByTransports = globalSettingsContext.filterbar.transports;

	const [dataFilteredState, setDataFilteredState] = useState<NetworkStop[]>([]);
	const [dataFilteredGeojsonFCState, setDataFilteredGeojsonFCState] = useState<GeoJSON.FeatureCollection<GeoJSON.Point, GeoJSON.GeoJsonProperties>>();

	const [filterByAttributeState, setFilterByAttributeState] = useState <StopsListContextState['filters']['by_attribute']>(null);
	const [filterByCurrentViewState, setFilterByCurrentViewState] = useState <StopsListContextState['filters']['by_current_view']>('map');
	const [filterByFacilityState, setFilterByFacilityState] = useState <StopsListContextState['filters']['by_facility']>(null);
	const [filterByMunicipalityOrLocalityState, setFilterByMunicipalityOrLocalityState] = useState <StopsListContextState['filters']['by_municipality_or_locality']>(null);
	const [filterBySearchState, setFilterBySearchState] = useState <StopsListContextState['filters']['by_search']>('');

	//
	// B. Transform data

	const searchHook = useMemo(() => {
		// Prepare data for search function
		const preparedSearchCollection = stopsContext.data.stops.map((item) => {
			return {
				...item,
			};
		});
		return createDocCollection(preparedSearchCollection, {
			id: 2,
			// locality_name: 1.5,
			long_name: 1,
			short_name: 1,
			tts_name: 1.5,
		}, {
			threshold: 1.7,
		});
	}, [stopsContext.data.stops]);

	const applyFiltersToData = (allData: NetworkStop[] = []) => {
		//

		let filterResult = allData;

		//
		// Filter by by_search

		if (filterBySearchState) {
			filterResult = searchHook.search(filterBySearchState) || filterResult;
		}

		//
		// Filter by_attribute

		if (filterByAttributeState) {
			filterResult = filterResult.filter(() => {
				return true;
			});
		}

		//
		// Filter by_facility

		if (filterByFacilityState) {
			filterResult = filterResult.filter(() => {
				return true;
			});
		}

		//
		// Filter by by_municipality_or_locality

		if (filterByMunicipalityOrLocalityState) {
			filterResult = filterResult.filter(() => {
				return true; // line.municipality_id === filtersState.by_municipality;
			});
		}

		//
		// Filter by by_agency / transports (derived via Vehicles snapshot)

		if (filterByAgency.length > 0 || filterByTransports.length > 0) {
			filterResult = filterResult.filter((stop) => {
				const rawStop = stop as {
					agency_ids?: string[]
					flags?: { agency_ids?: string[] }[]
					line_ids?: string[]
				};
				const lineIds = Array.isArray(stop.line_ids) ? stop.line_ids : [];
				const candidateAgencyIds = new Set<string>();
				if (Array.isArray(rawStop.agency_ids)) {
					rawStop.agency_ids.filter(Boolean).forEach(id => candidateAgencyIds.add(id));
				}
				if (Array.isArray(rawStop.flags)) {
					rawStop.flags.forEach((flag) => {
						if (Array.isArray(flag.agency_ids)) {
							flag.agency_ids.filter(Boolean).forEach(id => candidateAgencyIds.add(id));
						}
					});
				}
				for (const lineId of lineIds) {
					const lineAgencies = lineIdToAgencyIds.get(lineId);
					if (!lineAgencies) continue;
					for (const agencyId of lineAgencies) {
						candidateAgencyIds.add(agencyId);
					}
				}
				if (candidateAgencyIds.size === 0) return false;
				for (const agencyId of candidateAgencyIds) {
					if (!agencyMatchesSelection(agencyId, filterByAgency)) continue;
					if (!agencyMatchesTransports(agencyId, filterByTransports)) continue;
					return true;
				}
				return false;
			});
		}

		//
		// Return resulting items

		return filterResult;

		//
	};

	useEffect(() => {
		const filteredData = applyFiltersToData(stopsContext.data.stops);
		setDataFilteredState(filteredData);
	}, [stopsContext.data.stops, filterByAttributeState, filterByFacilityState, filterByMunicipalityOrLocalityState, filterBySearchState, filterByAgency, filterByTransports, lineIdToAgencyIds]);

	useEffect(() => {
		// Check if all data is available
		if (!dataFilteredState) return;
		// Initialize worker if not already initialized
		const collection = getBaseGeoJsonFeatureCollection();
		dataFilteredState.forEach((stop) => {
			const stopFC = transformStopDataIntoGeoJsonFeature(stop);
			if (stopFC) collection.features.push(stopFC);
		});
		// Set state value
		setDataFilteredGeojsonFCState(collection);
		//
	}, [dataFilteredState]);

	//
	// C. Handle actions

	const updateFilterByAttribute = (value: StopsListContextState['filters']['by_attribute']) => {
		setFilterByAttributeState(value || null);
	};

	const updateFilterByCurrentView = (value: StopsListContextState['filters']['by_current_view']) => {
		setFilterByCurrentViewState(value);
	};

	const updateFilterByFacility = (value: StopsListContextState['filters']['by_facility']) => {
		setFilterByFacilityState(value || null);
	};

	const updateFilterByMunicipalityOrLocality = (value: StopsListContextState['filters']['by_municipality_or_locality']) => {
		setFilterByMunicipalityOrLocalityState(value || null);
	};

	const updateFilterBySearch = (value: StopsListContextState['filters']['by_search']) => {
		setFilterBySearchState(value);
	};

	//
	// D. Define context value

	const contextValue: StopsListContextState = {
		actions: {
			updateFilterByAttribute,
			updateFilterByCurrentView,
			updateFilterByFacility,
			updateFilterByMunicipalityOrLocality,
			updateFilterBySearch,
		},
		data: {
			filtered: dataFilteredState,
			filtered_fc: dataFilteredGeojsonFCState || getBaseGeoJsonFeatureCollection(),
		},
		filters: {
			by_attribute: filterByAttributeState,
			by_current_view: filterByCurrentViewState,
			by_facility: filterByFacilityState,
			by_municipality_or_locality: filterByMunicipalityOrLocalityState,
			by_search: filterBySearchState,
		},
		flags: {
			is_loading: stopsContext.flags.is_loading,
		},
	};

	//
	// E. Render components

	return (
		<StopsListContext.Provider value={contextValue}>
			{children}
		</StopsListContext.Provider>
	);

	//
};
