'use client';

/* * */

import { Dates } from '@tmlmobilidade/dates';
import { CreateFileExportDto, SamsAnalysisExportProperties } from '@tmlmobilidade/types';
import { closeModal, useExportsContext, useToast } from '@tmlmobilidade/ui';
import { createContext, type PropsWithChildren, useCallback, useContext, useMemo, useState } from 'react';

/* * */

export const SAM_EXPORT_MODAL_ID = 'sams-export-modal';

export interface SamsExportSummaryFilter {
	key: string
	value: number | string | string[]
}

export interface SamsExportContextState {
	actions: {
		exportSams: () => void
	}
	filters: SamsExportSummaryFilter[]
	flags: {
		canSave: boolean
		error: Error | undefined
		loading: boolean
	}
}

const SamsExportContext = createContext<SamsExportContextState | undefined>(undefined);

export function useSamsExportContext() {
	const context = useContext(SamsExportContext);
	if (!context) {
		throw new Error('useSamsExportContext must be used within a SamsExportContextProvider');
	}
	return context;
}

export const SamsExportContextProvider = ({ children, favoritesEnabled, initialExportProperties, initialSummaryFilters, samIds }: PropsWithChildren<{ favoritesEnabled: boolean, initialExportProperties: Partial<SamsAnalysisExportProperties['properties']>, initialSummaryFilters: SamsExportSummaryFilter[], samIds: number[] }>) => {
	//

	//
	// A. Setup variables

	const exports = useExportsContext();
	const [loading, setLoading] = useState(false);

	//
	// B. Handle actions

	const exportSams = useCallback(async () => {
		if (loading) return;

		const samIdsToExport = samIds.length > 0
			? samIds
			: (initialExportProperties.sam_ids ?? []);

		const hasAnyConstraint = [
			samIdsToExport.length > 0,
			(initialExportProperties.agency_ids?.length ?? 0) > 0,
			(initialExportProperties.apex_versions?.length ?? 0) > 0,
			(initialExportProperties.search?.trim().length ?? 0) > 0,
			initialExportProperties.seen_first_at != null,
			initialExportProperties.seen_last_at != null,
			initialExportProperties.start_time != null,
			initialExportProperties.end_time != null,
			(initialExportProperties.statuses?.length ?? 0) > 0,
		].some(Boolean);

		if (!hasAnyConstraint) return;

		const fileName = `sams-analysis_${Dates.now('utc').operational_date}_${Date.now()}.csv`;

		const createFileExportDto: CreateFileExportDto<SamsAnalysisExportProperties> = {
			created_by: 'will-be-set-by-api',
			file_id: null,
			file_name: fileName,
			processing_status: 'waiting',
			properties: {
				...initialExportProperties,
				favorites_only: favoritesEnabled || undefined,
				sam_ids: samIdsToExport.length > 0 ? samIdsToExport : undefined,
			},
			type: 'sams_analysis',
		};

		setLoading(true);
		try {
			const fileExport = await exports.actions.create(createFileExportDto);
			if (!fileExport) return;
			useToast.success({ message: 'A exportação foi iniciada', title: 'Sucesso' });
			closeModal(SAM_EXPORT_MODAL_ID);
		} catch (error) {
			useToast.error({ message: error instanceof Error ? error.message : 'Erro ao iniciar a exportação', title: 'Erro' });
		} finally {
			setLoading(false);
		}
	}, [
		exports.actions,
		favoritesEnabled,
		initialExportProperties,
		loading,
		samIds,
	]);

	//
	// C. Define context value

	const contextValue: SamsExportContextState = useMemo(() => {
		const hasAnyConstraint = [
			samIds.length > 0,
			(initialExportProperties.sam_ids?.length ?? 0) > 0,
			(initialExportProperties.agency_ids?.length ?? 0) > 0,
			(initialExportProperties.apex_versions?.length ?? 0) > 0,
			(initialExportProperties.search?.trim().length ?? 0) > 0,
			initialExportProperties.seen_first_at != null,
			initialExportProperties.seen_last_at != null,
			initialExportProperties.start_time != null,
			initialExportProperties.end_time != null,
			(initialExportProperties.statuses?.length ?? 0) > 0,
		].some(Boolean);

		return {
			actions: {
				exportSams,
			},
			filters: initialSummaryFilters,
			flags: {
				canSave: hasAnyConstraint && !loading,
				error: undefined,
				loading,
			},
		};
	}, [exportSams, initialExportProperties, initialSummaryFilters, loading, samIds]);

	//
	// D. Render components

	return (
		<SamsExportContext.Provider value={contextValue}>
			{children}
		</SamsExportContext.Provider>
	);
};
