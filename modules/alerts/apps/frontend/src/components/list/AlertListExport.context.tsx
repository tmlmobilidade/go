'use client';

/* * */

import { useAlertsListContext } from '@/components/list/AlertsList.context';
import { type AlertExportProperties, CreateFileExportDto } from '@tmlmobilidade/types';
import { closeModal, useAgenciesContext, useExportsContext, useToast } from '@tmlmobilidade/ui';
import { createContext, type PropsWithChildren, useCallback, useContext, useMemo, useState } from 'react';

/* * */

export const ALERT_LIST_EXPORT_MODAL_ID = 'alert-list-export-modal';

export interface AlertListExportSummaryFilter {
	label: string
	value: string
}

export interface AlertListExportContextState {
	actions: {
		exportAlerts: () => void
	}
	filters: AlertListExportSummaryFilter[]
	flags: {
		canSave: boolean
		error: Error | undefined
		loading: boolean
	}
}

const AlertListExportContext = createContext<AlertListExportContextState | undefined>(undefined);

export function useAlertsListExportContext() {
	const context = useContext(AlertListExportContext);
	if (!context) {
		throw new Error('useAlertListExportContext must be used within a AlertListExportContextProvider');
	}
	return context;
}

export const AlertsListExportContextProvider = ({ children }: PropsWithChildren) => {
	//

	//
	// A. Setup variables
	const agenciesContext = useAgenciesContext();
	const exports = useExportsContext();
	const alertsListContext = useAlertsListContext();
	const [loading, setLoading] = useState(false);

	//
	// B. Transform data
	const activeFilters = useMemo(() => {
		const filters: AlertListExportSummaryFilter[] = [];
		const searchValue = alertsListContext.filters.search.value.trim();

		if (searchValue.length > 0) {
			filters.push({ label: 'Pesquisa', value: searchValue });
		}

		if (alertsListContext.filters.agency.isActive && alertsListContext.filters.agency.value.length > 0) {
			filters.push({ label: 'Operadores', value: agenciesContext.data.as_options.filter(option => alertsListContext.filters.agency.value.includes(option.value)).map(option => option.label).join(', ') });
		}

		if (alertsListContext.filters.publish_status.isActive && alertsListContext.filters.publish_status.value.length > 0) {
			filters.push({ label: 'Estado', value: alertsListContext.filters.publish_status.value.join(', ') });
		}

		if (alertsListContext.filters.cause.isActive && alertsListContext.filters.cause.value.length > 0) {
			filters.push({ label: 'Causa', value: alertsListContext.filters.cause.value.join(', ') });
		}

		if (alertsListContext.filters.effect.isActive && alertsListContext.filters.effect.value.length > 0) {
			filters.push({ label: 'Efeito', value: alertsListContext.filters.effect.value.join(', ') });
		}

		if (alertsListContext.filters.municipality.isActive && alertsListContext.filters.municipality.value.length > 0) {
			filters.push({ label: 'Município', value: alertsListContext.filters.municipality.value.join(', ') });
		}

		if (alertsListContext.filters.reference_type.isActive && alertsListContext.filters.reference_type.value.length > 0) {
			filters.push({ label: 'Tipo de Referência', value: alertsListContext.filters.reference_type.value.join(', ') });
		}

		return filters;
	}, [alertsListContext.filters.search.value, alertsListContext.filters.agency.isActive, alertsListContext.filters.agency.value, alertsListContext.filters.publish_status.isActive, alertsListContext.filters.publish_status.value, alertsListContext.filters.cause.isActive, alertsListContext.filters.cause.value, alertsListContext.filters.effect.isActive, alertsListContext.filters.effect.value, alertsListContext.filters.municipality.isActive, alertsListContext.filters.municipality.value, alertsListContext.filters.reference_type.isActive, alertsListContext.filters.reference_type.value, agenciesContext.data.as_options]);

	const exportProperties = useMemo((): AlertExportProperties['properties'] => {
		const searchValue = alertsListContext.filters.search.value.trim();
		const hasSearch = searchValue.length > 0;
		const alertIds = alertsListContext.data.filtered.map(alert => alert._id);
		const activeAgencies = alertsListContext.filters.agency.value as AlertExportProperties['properties']['agency_ids'];

		return {
			agency_ids: alertsListContext.filters.agency.isActive && alertsListContext.filters.agency.value.length > 0
				? activeAgencies
				: undefined,
			alert_ids: alertIds,
			search: hasSearch ? searchValue : undefined,
		};
	}, [alertsListContext.data.filtered, alertsListContext.filters.agency.isActive, alertsListContext.filters.agency.value, alertsListContext.filters.search.value]);

	//
	// C. Handle actions

	const exportAlerts = useCallback(async () => {
		if (loading) return;
		const dateTag = new Date().toISOString().slice(0, 10);
		const fileName = `alerts_${dateTag}_${Date.now()}.csv`;
		const createFileExportDto: CreateFileExportDto<AlertExportProperties> = {
			created_by: 'will-be-set-by-api',
			file_id: null,
			file_name: fileName,
			processing_status: 'waiting',
			properties: exportProperties,
			type: 'alert',
		};
		setLoading(true);
		try {
			const fileExport = await exports.actions.create(createFileExportDto);

			if (!fileExport) return;
			useToast.success({ message: 'A exportação foi iniciada', title: 'Sucesso' });
			closeModal(ALERT_LIST_EXPORT_MODAL_ID);
		} catch (error) {
			useToast.error({ message: error instanceof Error ? error.message : 'Erro ao iniciar a exportação', title: 'Erro' });
		} finally {
			setLoading(false);
		}
	}, [exportProperties, exports.actions, loading]);
	//
	// D. Define context value

	const contextValue: AlertListExportContextState = useMemo(() => {
		return {
			actions: {
				exportAlerts,
			},
			filters: activeFilters,
			flags: {
				canSave: !loading,
				error: undefined,
				loading,
			},
		};
	}, [activeFilters, exportAlerts, loading]);

	//
	// E. Render components

	return (
		<AlertListExportContext.Provider value={contextValue}>
			{children}
		</AlertListExportContext.Provider>

	);
};
