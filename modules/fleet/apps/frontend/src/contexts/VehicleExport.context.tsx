'use client';

/* * */

import { CreateFileExportDto, type VehicleExportProperties } from '@tmlmobilidade/types';
import { closeModal, useAgenciesContext, useExportsContext, useToast } from '@tmlmobilidade/ui';
import { createContext, type PropsWithChildren, useCallback, useContext, useMemo, useState } from 'react';

import { VehicleListContextState } from './VehiclesList.context';

/* * */

export const VEHICLE_LIST_EXPORT_MODAL_ID = 'vehicle-list-export-modal';

export interface VehicleListExportSummaryFilter {
	label: string
	value: string
}

export interface VehicleListExportContextState {
	actions: {
		exportVehicles: () => void
	}
	filters: VehicleListExportSummaryFilter[]
	flags: {
		canSave: boolean
		error: Error | undefined
		loading: boolean
	}
}

const VehicleListExportContext = createContext<undefined | VehicleListExportContextState>(undefined);

export function useVehicleListExportContext() {
	const context = useContext(VehicleListExportContext);
	if (!context) {
		throw new Error('useVehicleListExportContext must be used within a VehicleListExportContextProvider');
	}
	return context;
}

export const VehicleListExportContextProvider = ({ children, vehiclesListContext }: PropsWithChildren<{ vehiclesListContext: VehicleListContextState }>) => {
	//

	//
	// A. Setup variables

	const agenciesContext = useAgenciesContext();

	const exports = useExportsContext();
	const [loading, setLoading] = useState(false);

	//
	// B. Transform data

	const activeFilters = useMemo(() => {
		const filters: VehicleListExportSummaryFilter[] = [];
		const searchValue = vehiclesListContext.filters.search.value.trim();

		if (searchValue.length > 0) {
			filters.push({ label: 'Pesquisa', value: searchValue });
		}

		const defaultAgencyIds = agenciesContext.data.raw.map(item => item._id);
		const activeAgencyIds = vehiclesListContext.filters.agency.value;
		const agencyFilterIsActive = defaultAgencyIds.length !== activeAgencyIds.length || !defaultAgencyIds.every(item => activeAgencyIds.includes(item));

		if (agencyFilterIsActive && activeAgencyIds.length > 0) {
			filters.push({ label: 'Operadores', value: agenciesContext.data.as_options.filter(option => activeAgencyIds.includes(option.value)).map(option => option.label).join(', ') });
		}

		return filters;
	}, [
		agenciesContext.data.as_options,
		agenciesContext.data.raw,
		vehiclesListContext.filters.agency.value,
		vehiclesListContext.filters.search.value,
	]);

	const exportProperties = useMemo((): VehicleExportProperties['properties'] => {
		const searchValue = vehiclesListContext.filters.search.value.trim();
		const hasSearch = searchValue.length > 0;
		const vehicleIds = vehiclesListContext.data.filtered.map(vehicle => vehicle._id);

		return {
			agency_ids: vehiclesListContext.filters.agency.value.length > 0 ? vehiclesListContext.filters.agency.value : undefined,
			search: hasSearch ? searchValue : undefined,
			vehicle_ids: vehicleIds,
		};
	}, [
		vehiclesListContext.data.filtered,
		vehiclesListContext.filters.agency.value,
		vehiclesListContext.filters.search.value,
	]);

	//
	// C. Handle actions

	const exportVehicles = useCallback(async () => {
		if (loading) return;

		const dateTag = new Date().toISOString().slice(0, 10);
		const fileName = `vehicles_${dateTag}_${Date.now()}.csv`;
		const createFileExportDto: CreateFileExportDto<VehicleExportProperties> = {
			created_by: 'will-be-set-by-api',
			file_id: null,
			file_name: fileName,
			processing_status: 'waiting',
			properties: exportProperties,
			type: 'vehicle',
		};

		setLoading(true);
		try {
			const fileExport = await exports.actions.create(createFileExportDto);
			if (!fileExport) return;
			useToast.success({ message: 'A exportação foi iniciada', title: 'Sucesso' });
			closeModal(VEHICLE_LIST_EXPORT_MODAL_ID);
		} catch (error) {
			useToast.error({ message: error instanceof Error ? error.message : 'Erro ao iniciar a exportação', title: 'Erro' });
		} finally {
			setLoading(false);
		}
	}, [exportProperties, exports.actions, loading]);

	//
	// D. Define context value

	const contextValue: VehicleListExportContextState = useMemo(() => {
		return {
			actions: {
				exportVehicles,
			},
			filters: activeFilters,
			flags: {
				canSave: !loading,
				error: undefined,
				loading,
			},
		};
	}, [activeFilters, exportVehicles, loading]);

	//
	// E. Render components

	return (
		<VehicleListExportContext.Provider value={contextValue}>
			{children}
		</VehicleListExportContext.Provider>
	);
};
