'use client';

import { useVehiclesListFilterAgency } from '@/components/vehicles/list/filters/VehiclesListFilterAgency/use-vehicles-list-filter-agency';
import { useVehiclesListFilterSearch } from '@/components/vehicles/list/filters/VehiclesListFilterSearch/use-vehicles-list-filter-search';
import { useVehiclesListData } from '@/components/vehicles/list/use-vehicles-list-data';
import { useVehiclesAgenciesData } from '@/components/vehicles/shared/use-vehicles-agencies-data';
import { type CreateFileExportDto, type VehicleExportProperties } from '@tmlmobilidade/go-types-downloads';
import { closeModal, useToast } from '@tmlmobilidade/ui';
import { createContext, type PropsWithChildren, useCallback, useContext, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { VEHICLES_LIST_EXPORT_MODAL_ID } from './VehiclesListExport.modal';

/* * */

export interface VehiclesListExportSummaryFilter {
	label: string
	value: string
}

export interface VehiclesListExportContextState {
	actions: {
		exportVehicles: () => void
	}
	filters: VehiclesListExportSummaryFilter[]
	flags: {
		canSave: boolean
		error: Error | undefined
		loading: boolean
	}
}

/* * */

const VehiclesListExportContext = createContext<undefined | VehiclesListExportContextState>(undefined);

export function useVehiclesListExportContext() {
	const context = useContext(VehiclesListExportContext);
	if (!context) {
		throw new Error('useVehiclesListExportContext must be used within a VehiclesListExportContextProvider');
	}
	return context;
}

/* * */

export function VehiclesListExportContextProvider({ children }: PropsWithChildren) {
	//

	//
	// A. Setup variables

	const { t } = useTranslation();

	const [loading, setLoading] = useState(false);

	const filterAgency = useVehiclesListFilterAgency();
	const filterSearch = useVehiclesListFilterSearch();

	const { data: vehiclesData } = useVehiclesListData();
	const { options: agencyOptions } = useVehiclesAgenciesData();

	//
	// B. Transform data

	const activeFilters = useMemo(() => {
		const filters: VehiclesListExportSummaryFilter[] = [];
		const searchValue = filterSearch.value.trim();

		if (searchValue.length > 0) {
			filters.push({ label: t('default:vehicles.list.VehiclesListExport.filters.search'), value: searchValue });
		}

		if (filterAgency.isActive && filterAgency.value.length > 0) {
			filters.push({
				label: t('default:vehicles.list.VehiclesListExport.filters.agency'),
				value: agencyOptions.filter(option => filterAgency.value.includes(option.value)).map(option => option.label).join(', '),
			});
		}

		return filters;
	}, [agencyOptions, filterAgency.isActive, filterAgency.value, filterSearch.value, t]);

	const exportProperties = useMemo((): VehicleExportProperties['properties'] => {
		const searchValue = filterSearch.value.trim();
		return {
			agency_ids: filterAgency.value.length > 0 ? filterAgency.value : undefined,
			search: searchValue.length > 0 ? searchValue : undefined,
			vehicle_ids: vehiclesData.map(vehicle => vehicle._id),
		};
	}, [filterAgency.value, filterSearch.value, vehiclesData]);

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
			// ponytail: downloads client not wired yet (same gap as SamsExport); replace when available
			void createFileExportDto;
			useToast.success({
				message: t('default:vehicles.list.VehiclesListExport.toast.success.message'),
				title: t('default:vehicles.list.VehiclesListExport.toast.success.title'),
			});
			closeModal(VEHICLES_LIST_EXPORT_MODAL_ID);
		} catch (error) {
			useToast.error({
				message: error instanceof Error ? error.message : t('default:vehicles.list.VehiclesListExport.toast.error.message'),
				title: t('default:vehicles.list.VehiclesListExport.toast.error.title'),
			});
		} finally {
			setLoading(false);
		}
	}, [exportProperties, loading, t]);

	//
	// D. Define context value

	const contextValue: VehiclesListExportContextState = useMemo(() => ({
		actions: {
			exportVehicles,
		},
		filters: activeFilters,
		flags: {
			canSave: !loading,
			error: undefined,
			loading,
		},
	}), [activeFilters, exportVehicles, loading]);

	//
	// E. Render components

	return (
		<VehiclesListExportContext.Provider value={contextValue}>
			{children}
		</VehiclesListExportContext.Provider>
	);
}
