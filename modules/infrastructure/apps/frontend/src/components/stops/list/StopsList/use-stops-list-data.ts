'use client';

import { type StopNormalized } from '@/types/normalized';
import { API_ROUTES } from '@tmlmobilidade/consts';
import { getBaseGeoJsonFeatureCollection } from '@tmlmobilidade/geo';
import { type Stop } from '@tmlmobilidade/go-types-infrastructure';
import { normalizeString } from '@tmlmobilidade/strings';
import { type MapOverlayMultipleStopsDataProps, useLocationsContext, useSearch } from '@tmlmobilidade/ui';
import { type FeatureCollection, type Point } from 'geojson';
import { useMemo } from 'react';
import useSWR from 'swr';

import { useStopsListFilterAgencies } from '../StopsListFilterAgencies/use-stops-list-filter-agencies';
import { useStopsListFilterConnections } from '../StopsListFilterConnections/use-stops-list-filter-connections';
import { useStopsListFilterEquipment } from '../StopsListFilterEquipment/use-stops-list-filter-equipment';
import { useStopsListFilterFacilities } from '../StopsListFilterFacilities/use-stops-list-filter-facilities';
import { useStopsListFilterLifecycleStatus } from '../StopsListFilterLifecycleStatus/use-stops-list-filter-lifecycle-status';
import { useStopsListFilterMunicipality } from '../StopsListFilterMunicipality/use-stops-list-filter-municipality';
import { useStopsListFilterSearch } from '../StopsListHeader/use-stops-list-filter-search';

/* * */

interface UseStopsListDataReturnType {
	data: {
		features: FeatureCollection<Point, MapOverlayMultipleStopsDataProps> | null
		filtered: StopNormalized[]
		raw: Stop[]
	}
	error: Error | undefined
	isLoading: boolean
}

/* * */

export function useStopsListData(): UseStopsListDataReturnType {
	//

	//
	// A. Setup variables

	const locationsContext = useLocationsContext();

	const filterSearch = useStopsListFilterSearch();
	const filterAgencies = useStopsListFilterAgencies();
	const filterConnections = useStopsListFilterConnections();
	const filterEquipment = useStopsListFilterEquipment();
	const filterFacilities = useStopsListFilterFacilities();
	const filterLifecycleStatus = useStopsListFilterLifecycleStatus();
	const filterMunicipality = useStopsListFilterMunicipality();

	//
	// B. Fetch data

	const { data: allStopsData, error, isLoading } = useSWR<Stop[]>(API_ROUTES.infrastructure.STOPS_LIST, { refreshInterval: 5000 });

	//
	// C. Transform data

	const normalizedStopsData: StopNormalized[] = useMemo(() => {
		if (!allStopsData?.length) return [];

		return allStopsData.map((item): StopNormalized => ({
			...item,
			district_name: locationsContext.actions.getDistrict(item.district_id)?.name ?? '',
			legacy_ids_normalized: item.legacy_ids?.map(String).join(' '),
			locality_name: locationsContext.actions.getLocality(item.locality_id)?.name ?? 'N/A',
			municipality_name: locationsContext.actions.getMunicipality(item.municipality_id)?.name ?? '',
			name_normalized: normalizeString(item.name),
			new_name_normalized: normalizeString(item.new_name),
			parish_name: locationsContext.actions.getParish(item.parish_id)?.name ?? '',
		}));
	}, [allStopsData, locationsContext]);

	const searchResultsData = useSearch<StopNormalized>({
		accessors: ['_id', 'name_normalized', 'new_name_normalized', 'legacy_ids_normalized'],
		data: normalizedStopsData,
		query: filterSearch.value,
	});

	const filteredStopsData = useMemo(() => {
		if (!searchResultsData?.length) return [];

		return searchResultsData
			.filter((stopData: StopNormalized) => {
				const lifecycleStatusMatch = filterLifecycleStatus.value.includes(stopData.lifecycle_status);
				const matchesFacilities = stopData.facilities?.length ? stopData.facilities.some(item => filterFacilities.value.includes(item)) : true;
				const matchesEquipment = stopData.equipment?.length ? stopData.equipment.some(item => filterEquipment.value.includes(item)) : true;
				const matchesConnections = stopData.connections?.length ? stopData.connections.some(item => filterConnections.value.includes(item)) : true;
				const stopAgencyIds = stopData.flags?.flatMap(flag => flag.agency_ids) ?? [];
				const matchesAgencies = !filterAgencies.isActive || stopAgencyIds.some(agencyId => filterAgencies.value.includes(agencyId));
				const matchesMunicipalities = !filterMunicipality.isActive || filterMunicipality.value.includes(stopData.municipality_id);

				return lifecycleStatusMatch && matchesFacilities && matchesEquipment && matchesConnections && matchesAgencies && matchesMunicipalities;
			})
			.sort((a, b) => String(a._id)?.localeCompare(String(b._id)));
	}, [
		searchResultsData,
		filterAgencies.isActive,
		filterAgencies.value,
		filterLifecycleStatus,
		filterFacilities,
		filterEquipment,
		filterConnections,
		filterMunicipality.isActive,
		filterMunicipality.value,
	]);

	const stopsAsGeojsonFC = useMemo(() => {
		const baseGeoJson = getBaseGeoJsonFeatureCollection<Point, MapOverlayMultipleStopsDataProps>();
		if (!filteredStopsData?.length) return baseGeoJson;

		baseGeoJson.features = filteredStopsData.map(item => ({
			geometry: {
				coordinates: [item.longitude, item.latitude],
				type: 'Point',
			},
			properties: {
				id: String(item._id),
				name: item.name,
			},
			type: 'Feature',
		}));

		return baseGeoJson;
	}, [filteredStopsData]);

	//
	// D. Return data

	return useMemo(() => ({
		data: {
			features: stopsAsGeojsonFC,
			filtered: filteredStopsData,
			raw: allStopsData ?? [],
		},
		error,
		isLoading,
	}), [allStopsData, error, filteredStopsData, isLoading, stopsAsGeojsonFC]);
}
