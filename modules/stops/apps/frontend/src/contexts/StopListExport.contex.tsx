'use client';

/* * */

import { useStopsListContext } from '@/components/stops/list/StopsList.context';
import { CreateFileExportDto, type StopExportProperties } from '@tmlmobilidade/types';
import { closeModal, useAgenciesContext, useExportsContext, useToast } from '@tmlmobilidade/ui';
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

	const exports = useExportsContext();
	const stopsListContext = useStopsListContext();
	const [loading, setLoading] = useState(false);

	//
	// B. Transform data

	const activeFilters = useMemo(() => {
		const filters: StopListExportSummaryFilter[] = [];
		const searchValue = stopsListContext.filters.search.value.trim();

		if (searchValue.length > 0) {
			filters.push({ label: 'Pesquisa', value: searchValue });
		}

		if (stopsListContext.filters.agencies.isActive && stopsListContext.filters.agencies.value.length > 0) {
			filters.push({ label: 'Operadores', value: agenciesContext.data.as_options.filter(option => stopsListContext.filters.agencies.value.includes(option.value)).map(option => option.label).join(', ') });
		}

		if (stopsListContext.filters.lifecycle_status.isActive && stopsListContext.filters.lifecycle_status.value.length > 0) {
			filters.push({ label: 'Estado', value: stopsListContext.filters.lifecycle_status.value.join(', ') });
		}

		if (stopsListContext.filters.facilities.isActive && stopsListContext.filters.facilities.value.length > 0) {
			filters.push({ label: 'Serviços', value: stopsListContext.filters.facilities.value.join(', ') });
		}

		if (stopsListContext.filters.equipment.isActive && stopsListContext.filters.equipment.value.length > 0) {
			filters.push({ label: 'Equipamentos', value: stopsListContext.filters.equipment.value.join(', ') });
		}

		if (stopsListContext.filters.connections.isActive && stopsListContext.filters.connections.value.length > 0) {
			filters.push({ label: 'Conexões', value: stopsListContext.filters.connections.value.join(', ') });
		}

		return filters;
	}, [
		stopsListContext.filters.connections.isActive,
		stopsListContext.filters.connections.value,
		stopsListContext.filters.agencies.isActive,
		stopsListContext.filters.agencies.value,
		stopsListContext.filters.equipment.isActive,
		stopsListContext.filters.equipment.value,
		stopsListContext.filters.facilities.isActive,
		stopsListContext.filters.facilities.value,
		stopsListContext.filters.lifecycle_status.isActive,
		stopsListContext.filters.lifecycle_status.value,
		stopsListContext.filters.search.value,
	]);

	const exportProperties = useMemo((): StopExportProperties['properties'] => {
		const searchValue = stopsListContext.filters.search.value.trim();
		const hasSearch = searchValue.length > 0;
		const activeConnections = stopsListContext.filters.connections.value as StopExportProperties['properties']['connections'];
		const activeEquipment = stopsListContext.filters.equipment.value as StopExportProperties['properties']['equipment'];
		const activeFacilities = stopsListContext.filters.facilities.value as StopExportProperties['properties']['facilities'];
		const activeLifecycleStatuses = stopsListContext.filters.lifecycle_status.value as StopExportProperties['properties']['lifecycle_statuses'];
		const stopIds = stopsListContext.data.filtered.map(stop => stop._id);

		return {
			connections: stopsListContext.filters.connections.isActive && stopsListContext.filters.connections.value.length > 0
				? activeConnections
				: undefined,
			equipment: stopsListContext.filters.equipment.isActive && stopsListContext.filters.equipment.value.length > 0
				? activeEquipment
				: undefined,
			facilities: stopsListContext.filters.facilities.isActive && stopsListContext.filters.facilities.value.length > 0
				? activeFacilities
				: undefined,
			lifecycle_statuses: stopsListContext.filters.lifecycle_status.isActive && stopsListContext.filters.lifecycle_status.value.length > 0
				? activeLifecycleStatuses
				: undefined,
			search: hasSearch ? searchValue : undefined,
			stop_ids: stopIds,
		};
	}, [
		stopsListContext.data.filtered,
		stopsListContext.filters.connections.isActive,
		stopsListContext.filters.connections.value,
		stopsListContext.filters.equipment.isActive,
		stopsListContext.filters.equipment.value,
		stopsListContext.filters.facilities.isActive,
		stopsListContext.filters.facilities.value,
		stopsListContext.filters.lifecycle_status.isActive,
		stopsListContext.filters.lifecycle_status.value,
		stopsListContext.filters.search.value,
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
