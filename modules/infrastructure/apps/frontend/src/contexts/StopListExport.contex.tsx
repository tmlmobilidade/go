'use client';

import { useStopsListData } from '@/components/stops/list/use-stops-list-data';
import { useStopsListFilterAgencies } from '@/components/stops/list/filters/StopsListFilterAgency/use-stops-list-filter-agency';
import { useStopsListFilterConnections } from '@/components/stops/list/filters/StopsListFilterConnections/use-stops-list-filter-connections';
import { useStopsListFilterEquipment } from '@/components/stops/list/filters/StopsListFilterEquipment/use-stops-list-filter-equipment';
import { useStopsListFilterFacilities } from '@/components/stops/list/filters/StopsListFilterFacilities/use-stops-list-filter-facilities';
import { useStopsListFilterLifecycleStatus } from '@/components/stops/list/filters/StopsListFilterLifecycleStatus/use-stops-list-filter-lifecycle-status';
import { useStopsListFilterMunicipality } from '@/components/stops/list/filters/StopsListFilterMunicipality/use-stops-list-filter-municipality';
import { useStopsListFilterSearch } from '@/components/stops/list/StopsListHeader/use-stops-list-filter-search';
import { type CreateFileExportDto, type StopExportProperties } from '@tmlmobilidade/go-types-downloads';
import { closeModal, useAgenciesContext, useExportsContext, useLocationsContext, useToast } from '@tmlmobilidade/ui';
import { createContext, type PropsWithChildren, useCallback, useContext, useMemo, useState } from 'react';

/* * */

export const STOP_LIST_EXPORT_MODAL_ID = 'stop-list-export-modal';

export interface StopListExportSummaryFilter {
	label: string
	value: string
}

export interface StopListExportContextState {
	actions: {
		exportStops: () => void
	}
	filters: StopListExportSummaryFilter[]
	flags: {
		canSave: boolean
		error: Error | undefined
		loading: boolean
	}
}

const StopListExportContext = createContext<StopListExportContextState | undefined>(undefined);

export function useStopListExportContext() {
	const context = useContext(StopListExportContext);
	if (!context) {
		throw new Error('useStopListExportContext must be used within a StopListExportContextProvider');
	}
	return context;
}

export const StopListExportContextProvider = ({ children }: PropsWithChildren) => {
	//

	//
	// A. Setup variables
	const agenciesContext = useAgenciesContext();
	const locationsContext = useLocationsContext();

	const exports = useExportsContext();
	const stopsListData = useStopsListData();
	const filterSearch = useStopsListFilterSearch();
	const filterAgencies = useStopsListFilterAgencies();
	const filterLifecycleStatus = useStopsListFilterLifecycleStatus();
	const filterFacilities = useStopsListFilterFacilities();
	const filterEquipment = useStopsListFilterEquipment();
	const filterConnections = useStopsListFilterConnections();
	const filterMunicipality = useStopsListFilterMunicipality();
	const [loading, setLoading] = useState(false);

	//
	// B. Transform data

	const activeFilters = useMemo(() => {
		const filters: StopListExportSummaryFilter[] = [];
		const searchValue = filterSearch.value.trim();

		if (searchValue.length > 0) {
			filters.push({ label: 'Pesquisa', value: searchValue });
		}

		if (filterAgencies.isActive && filterAgencies.value.length > 0) {
			filters.push({ label: 'Operadores', value: agenciesContext.data.as_options.filter(option => filterAgencies.value.includes(option.value)).map(option => option.label).join(', ') });
		}

		if (filterLifecycleStatus.isActive && filterLifecycleStatus.value.length > 0) {
			filters.push({ label: 'Estado', value: filterLifecycleStatus.value.join(', ') });
		}

		if (filterFacilities.isActive && filterFacilities.value.length > 0) {
			filters.push({ label: 'Serviços', value: filterFacilities.value.join(', ') });
		}

		if (filterEquipment.isActive && filterEquipment.value.length > 0) {
			filters.push({ label: 'Equipamentos', value: filterEquipment.value.join(', ') });
		}

		if (filterConnections.isActive && filterConnections.value.length > 0) {
			filters.push({ label: 'Conexões', value: filterConnections.value.join(', ') });
		}
		if (filterMunicipality.isActive && filterMunicipality.value.length > 0) {
			filters.push({ label: 'Municípios', value: Array.from(locationsContext.data.municipalities.values()).filter(option => filterMunicipality.value.includes(option._id)).map(option => option.name).join(', ') });
		}

		return filters;
	}, [filterSearch.value, filterAgencies.isActive, filterAgencies.value, filterLifecycleStatus.isActive, filterLifecycleStatus.value, filterFacilities.isActive, filterFacilities.value, filterEquipment.isActive, filterEquipment.value, filterConnections.isActive, filterConnections.value, filterMunicipality.isActive, filterMunicipality.value, agenciesContext.data.as_options, locationsContext.data.municipalities]);

	const exportProperties = useMemo((): StopExportProperties['properties'] => {
		const searchValue = filterSearch.value.trim();
		const hasSearch = searchValue.length > 0;
		const activeConnections = filterConnections.value as StopExportProperties['properties']['connections'];
		const activeEquipment = filterEquipment.value as StopExportProperties['properties']['equipment'];
		const activeFacilities = filterFacilities.value as StopExportProperties['properties']['facilities'];
		const activeLifecycleStatuses = filterLifecycleStatus.value as StopExportProperties['properties']['lifecycle_statuses'];
		const stopIds = stopsListData.data.filtered.map(stop => stop._id);

		return {
			connections: filterConnections.isActive && filterConnections.value.length > 0
				? activeConnections
				: undefined,
			equipment: filterEquipment.isActive && filterEquipment.value.length > 0
				? activeEquipment
				: undefined,
			facilities: filterFacilities.isActive && filterFacilities.value.length > 0
				? activeFacilities
				: undefined,
			lifecycle_statuses: filterLifecycleStatus.isActive && filterLifecycleStatus.value.length > 0
				? activeLifecycleStatuses
				: undefined,
			search: hasSearch ? searchValue : undefined,
			stop_ids: stopIds,
		};
	}, [
		stopsListData.data.filtered,
		filterConnections.isActive,
		filterConnections.value,
		filterEquipment.isActive,
		filterEquipment.value,
		filterFacilities.isActive,
		filterFacilities.value,
		filterLifecycleStatus.isActive,
		filterLifecycleStatus.value,
		filterSearch.value,
	]);

	//
	// C. Handle actions

	const exportStops = useCallback(async () => {
		if (loading) return;

		const dateTag = new Date().toISOString().slice(0, 10);
		const fileName = `stops_${dateTag}_${Date.now()}.csv`;
		const createFileExportDto: CreateFileExportDto<StopExportProperties> = {
			created_by: 'will-be-set-by-api',
			file_id: null,
			file_name: fileName,
			processing_status: 'waiting',
			properties: exportProperties,
			type: 'stop',
		};

		setLoading(true);
		try {
			const fileExport = await exports.actions.create(createFileExportDto);
			if (!fileExport) return;
			useToast.success({ message: 'A exportação foi iniciada', title: 'Sucesso' });
			closeModal(STOP_LIST_EXPORT_MODAL_ID);
		} catch (error) {
			useToast.error({ message: error instanceof Error ? error.message : 'Erro ao iniciar a exportação', title: 'Erro' });
		} finally {
			setLoading(false);
		}
	}, [exportProperties, exports.actions, loading]);

	//
	// D. Define context value

	const contextValue: StopListExportContextState = useMemo(() => {
		return {
			actions: {
				exportStops,
			},
			filters: activeFilters,
			flags: {
				canSave: !loading,
				error: undefined,
				loading,
			},
		};
	}, [activeFilters, exportStops, loading]);

	//
	// E. Render components

	return (
		<StopListExportContext.Provider value={contextValue}>
			{children}
		</StopListExportContext.Provider>
	);
};
