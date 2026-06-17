'use client';

import { RIDES_EXPORT_MODAL_ID } from '@/components/rides/export/RidesExportModal';
import { RidesListContextState } from '@/components/rides/list/RidesList.context';
import { Dates } from '@tmlmobilidade/dates';
import { CreateFileExportDto, DelayStatus, OperationalStatus, RideAnalysisGradeWithNone, RideExportProperties, type UnixTimestamp } from '@tmlmobilidade/types';
import { closeModal, useExportsContext, useToast } from '@tmlmobilidade/ui';
import { createContext, type PropsWithChildren, useContext, useMemo, useState } from 'react';

/* * */

interface RidesExportModalContextState {
	actions: {
		exportRides: () => void
		setFilterDateEnd: (value: number) => void
		setFilterDateStart: (value: number) => void
	}
	filters: RidesListContextState['filters']
	flags: {
		canSave: boolean
		error: Error | undefined
		loading: boolean
	}
}

/* * */

const RidesExportModalContext = createContext<RidesExportModalContextState | undefined>(undefined);

export function useRidesExportModalContext() {
	const context = useContext(RidesExportModalContext);
	if (!context) {
		throw new Error('useRidesExportModalContext must be used within a RidesExportModalContextProvider');
	}
	return context;
}

/* * */

export const RidesExportModalContextProvider = ({ children, initialFilters }: PropsWithChildren<{ initialFilters: RidesListContextState['filters'] }>) => {
	//

	//
	// A. Setup variables

	const exports = useExportsContext();

	const [filterDateEnd, setFilterDateEnd] = useState<number>(initialFilters.date_end);
	const [filterDateStart, setFilterDateStart] = useState<number>(initialFilters.date_start);

	//
	// B. Transform data

	//
	// C. Handle actions
	async function exportRides() {
		if (!initialFilters.date_start || !initialFilters.date_end) return;

		const fileName = `${Dates.fromUnixTimestamp(filterDateStart).setZone('Europe/Lisbon', 'offset_only').operational_date}_${Dates.fromUnixTimestamp(filterDateEnd).setZone('Europe/Lisbon', 'offset_only').operational_date}.csv`;
		const createFileExportDto: CreateFileExportDto<RideExportProperties> = {
			created_by: 'will-be-set-by-api',
			file_id: null,
			file_name: fileName,
			processing_status: 'waiting',
			properties: {
				acceptance_status: initialFilters.acceptance_status.value,
				agency_ids: initialFilters.agency.value,
				analysis_ended_at_last_stop_grade: initialFilters.analysis_ended_at_last_stop.value as RideAnalysisGradeWithNone[],
				analysis_expected_apex_validation_interval: initialFilters.analysis_expected_apex_validation_interval.value as RideAnalysisGradeWithNone[],
				analysis_simple_three_vehicle_events_grade: initialFilters.analysis_simple_three_vehicle_events_grade.value as RideAnalysisGradeWithNone[],
				analysis_transaction_sequentiality: initialFilters.analysis_transaction_sequentiality.value as RideAnalysisGradeWithNone[],
				date_end: filterDateEnd as UnixTimestamp,
				date_start: filterDateStart as UnixTimestamp,
				delay_statuses: initialFilters.delay_status.value as DelayStatus[],
				operational_statuses: initialFilters.operational_status.value as OperationalStatus[],
				search: initialFilters.search.value || undefined,
			},
			type: 'ride',
		};

		try {
			const fileExport = await exports.actions.create(createFileExportDto);
			if (!fileExport) return;
			useToast.success({ message: 'A exportação foi iniciada', title: 'Sucesso' });
			closeModal(RIDES_EXPORT_MODAL_ID);
		} catch (error) {
			useToast.error({ message: error instanceof Error ? error.message : 'Erro ao iniciar a exportação', title: 'Erro' });
			return;
		}
	}

	//
	// D. Define context value

	const contextValue: RidesExportModalContextState = useMemo(() => {
		return {
			actions: {
				exportRides,
				setFilterDateEnd,
				setFilterDateStart,
			},
			filters: {
				acceptance_status: initialFilters.acceptance_status,
				agency: initialFilters.agency,
				analysis_ended_at_last_stop: initialFilters.analysis_ended_at_last_stop,
				analysis_expected_apex_validation_interval: initialFilters.analysis_expected_apex_validation_interval,
				analysis_simple_three_vehicle_events_grade: initialFilters.analysis_simple_three_vehicle_events_grade,
				analysis_transaction_sequentiality: initialFilters.analysis_transaction_sequentiality,
				date_end: initialFilters.date_end,
				date_start: initialFilters.date_start,
				delay_status: initialFilters.delay_status,
				operational_status: initialFilters.operational_status,
				search: initialFilters.search,
				ticketing_status: initialFilters.ticketing_status,
			},
			flags: {
				canSave: !!initialFilters.date_end && !!initialFilters.date_start,
				error: undefined,
				loading: false,
			},
		};
	}, [
		initialFilters.date_end,
		initialFilters.date_start,
		initialFilters.acceptance_status,
		initialFilters.agency,
		initialFilters.analysis_ended_at_last_stop,
		initialFilters.analysis_expected_apex_validation_interval,
		initialFilters.analysis_simple_three_vehicle_events_grade,
		initialFilters.analysis_transaction_sequentiality,
		initialFilters.delay_status,
		initialFilters.operational_status,
		initialFilters.ticketing_status,
	]);

	//
	// E. Render components

	return (
		<RidesExportModalContext.Provider value={contextValue}>
			{children}
		</RidesExportModalContext.Provider>
	);

	//
};
