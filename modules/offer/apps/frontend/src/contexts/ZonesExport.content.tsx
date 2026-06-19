'use client';

import { useZonesListContext } from '@/components/zones/list/ZonesList.context';
/***/

import { CreateFileExportDto, type ZoneExportProperties } from '@tmlmobilidade/types';
import { closeModal, useAgenciesContext, useToast } from '@tmlmobilidade/ui';
import { createContext, PropsWithChildren, useCallback, useContext, useMemo, useState } from 'react';

/***/

export const ZONE_LIST_EXPORT_MODAL_ID = 'zone-list-export-modal';

export interface ZoneListExportSummaryFilter {
	label: string
	value: string
}

export interface ZoneListExportContextState {
	actions: {
		exportZones: () => void
	}
	filters: ZoneListExportSummaryFilter[]
	flags: {
		CanSave: boolean
		error: Error | undefined
		loading: boolean
	}
}

const ZonesListExportContext = createContext<undefined | ZoneListExportContextState>(undefined);

export function useZonesListExportContext() {
	const context = useContext(ZonesListExportContext);
	if (!context) {
		throw new Error('useZoneListExportContext must be used within a ZoneListExportContextProvider');
	}
	return context;
}

export const ZonesListExportContextProvider = ({ children }: PropsWithChildren) => {
	//

	//
	// A. Setup variables
	const agenciesContext = useAgenciesContext();

	const zonesListContext = useZonesListContext();
	const [loading, setLoading] = useState(false);

	//
	// B. Transform data
	const activeFilters = useMemo(() => {
		const filters: ZoneListExportSummaryFilter[] = [];
		const searchValue = zonesListContext.filters.search.value.trim();

		if (searchValue.length > 0) {
			filters.push({ label: 'Pesquisa', value: searchValue });
		}

		if (zonesListContext.filters.agencies.isActive && zonesListContext.filters.agencies.value.length > 0) {
			filters.push({ label: 'Operadores', value: agenciesContext.data.as_options.filter(option => zonesListContext.filters.agencies.value.includes(option.value)).map(option => option.label).join(', ') });
		}

		return filters;
	}, [
		agenciesContext.data.as_options,
		zonesListContext.filters.agencies.isActive,
		zonesListContext.filters.agencies.value,
		zonesListContext.filters.search.value,
	]);

	const exportProperties = useMemo((): ZoneExportProperties['properties'] => {
		const searchValue = zonesListContext.filters.search.value.trim();
		const hasSearch = searchValue.length > 0;
		const activeAgencies = zonesListContext.filters.agencies.value as ZoneExportProperties['properties']['agencies'];

		return {
			agencies: zonesListContext.filters.agencies.isActive && zonesListContext.filters.agencies.value.length > 0
				? activeAgencies
				: undefined,
			search: hasSearch ? searchValue : undefined,
		};
	}, [
		zonesListContext.data.filtered,
		zonesListContext.filters.agencies.value,
		zonesListContext.filters.search.value,
	]);

	//
	// C. Handle actions

	const exportZones = useCallback(async () => {
		if (loading) return;

		const dateTag = new Date().toISOString().slice(0, 10);
		const fileName = `zones_${dateTag}_${Date.now()}.csv`;
		const createFileExportDto: CreateFileExportDto<ZoneExportProperties> = {
			created_by: 'will-be-set-by-api',
			file_id: null,
			file_name: fileName,
			processing_status: 'waiting',
			properties: exportProperties,
			type: 'zone',
		};

		setLoading(true);
		try {
			const fileExport = await exports.actions.create(createFileExportDto);
			if (!fileExport) return;
			useToast.success({ message: 'A exportação foi iniciada', title: 'Sucesso' });
			closeModal(ZONE_LIST_EXPORT_MODAL_ID);
		} catch (error) {
			useToast.error({ message: error instanceof Error ? error.message : 'Erro ao iniciar a exportação', title: 'Erro' });
		} finally {
			setLoading(false);
		}
	}, [exportProperties, loading]);

	//
	// D. Define context value

	const contextValue: ZoneListExportContextState = useMemo(() => {
		return {
			actions: {
				exportZones,
			},
			filters: activeFilters,
			flags: {
				CanSave: !loading,
				error: undefined,
				loading,
			},
		};
	}, [activeFilters, exportZones, loading]);

	//
	// E. Render components

	return (
		<ZonesListExportContext.Provider value={contextValue}>
			{children}
		</ZonesListExportContext.Provider>

	);
};
