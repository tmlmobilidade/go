'use client';

/* * */

import { RIDES_EXPORT_MODAL_ID } from '@/components/rides/export/RidesExportModal';
import { RidesListContextState } from '@/contexts/RidesList.context';
import { Dates } from '@tmlmobilidade/dates';
import { CreateFileExportDto, DelayStatus, OperationalStatus, RideAcceptanceStatus, RideAnalysisGradeWithNone, RideExportProperties, type UnixTimestamp } from '@tmlmobilidade/types';
import { closeModal, useExportsContext, useToast } from '@tmlmobilidade/ui';
import { createContext, type PropsWithChildren, useContext, useMemo, useState } from 'react';

/* * */

interface RidesExportModalContextState {
	actions: {
		exportRides: () => void
		setFilterAcceptanceStatus: (values: string[]) => void
		setFilterAgency: (values: string[]) => void
		setFilterAnalysisEndedAtLastStop: (values: string[]) => void
		setFilterAnalysisExpectedApexValidationInterval: (values: string[]) => void
		setFilterAnalysisSimpleThreeVehicleEvents: (values: string[]) => void
		setFilterAnalysisTransactionSequentiality: (values: string[]) => void
		setFilterDateEnd: (value: number) => void
		setFilterDateStart: (value: number) => void
		setFilterDelayStatus: (values: string[]) => void
		setFilterOperationalStatus: (values: string[]) => void
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
	const [filterAgency, setFilterAgency] = useState<string[]>(initialFilters.agency);
	const [filterDateEnd, setFilterDateEnd] = useState<number>(initialFilters.date_end);
	const [filterDateStart, setFilterDateStart] = useState<number>(initialFilters.date_start);
	const [filterDelayStatus, setFilterDelayStatus] = useState<string[]>(initialFilters.delay_status);
	const [filterOperationalStatus, setFilterOperationalStatus] = useState<string[]>(initialFilters.operational_status);
	const [filterAnalysisSimpleThreeVehicleEvents, setFilterAnalysisSimpleThreeVehicleEvents] = useState<string[]>(initialFilters.analysis_simple_three_vehicle_events_grade);
	const [filterAnalysisEndedAtLastStop, setFilterAnalysisEndedAtLastStop] = useState<string[]>(initialFilters.analysis_ended_at_last_stop);
	const [filterAnalysisExpectedApexValidationInterval, setFilterAnalysisExpectedApexValidationInterval] = useState<string[]>(initialFilters.analysis_expected_apex_validation_interval);
	const [filterAnalysisTransactionSequentiality, setFilterAnalysisTransactionSequentiality] = useState<string[]>(initialFilters.analysis_transaction_sequentiality);
	const [filterAcceptanceStatus, setFilterAcceptanceStatus] = useState<string[]>(initialFilters.acceptance_status);

	const exports = useExportsContext();

	//
	// B. Transform data

	//
	// C. Handle actions
	async function exportRides() {
		if (!filterDateStart || !filterDateEnd) return;

		const fileName = `${Dates.fromUnixTimestamp(filterDateStart).setZone('Europe/Lisbon', 'offset_only').operational_date}_${Dates.fromUnixTimestamp(filterDateEnd).setZone('Europe/Lisbon', 'offset_only').operational_date}.csv`;
		const createFileExportDto: CreateFileExportDto<RideExportProperties> = {
			created_by: 'will-be-set-by-api',
			file_id: null,
			file_name: fileName,
			processing_status: 'waiting',
			properties: {
				acceptance_status: filterAcceptanceStatus as RideAcceptanceStatus[],
				agency_ids: filterAgency,
				analysis_ended_at_last_stop_grade: filterAnalysisEndedAtLastStop as RideAnalysisGradeWithNone[],
				analysis_expected_apex_validation_interval: filterAnalysisExpectedApexValidationInterval as RideAnalysisGradeWithNone[],
				analysis_simple_three_vehicle_events_grade: filterAnalysisSimpleThreeVehicleEvents as RideAnalysisGradeWithNone[],
				analysis_transaction_sequentiality: filterAnalysisTransactionSequentiality as RideAnalysisGradeWithNone[],
				date_end: filterDateEnd as UnixTimestamp,
				date_start: filterDateStart as UnixTimestamp,
				delay_statuses: filterDelayStatus as DelayStatus[],
				operational_statuses: filterOperationalStatus as OperationalStatus[],
				search: initialFilters.search || undefined,
			},
			type: 'ride',
		};

		try {
			const fileExport = await exports.actions.create(createFileExportDto);
			if (!fileExport) return;
			useToast.success({ message: 'A exportação foi iniciada', title: 'Sucesso' });
			closeModal(RIDES_EXPORT_MODAL_ID);
		}
		catch (error) {
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
				setFilterAcceptanceStatus,
				setFilterAgency,
				setFilterAnalysisEndedAtLastStop,
				setFilterAnalysisExpectedApexValidationInterval,
				setFilterAnalysisSimpleThreeVehicleEvents,
				setFilterAnalysisTransactionSequentiality,
				setFilterDateEnd,
				setFilterDateStart,
				setFilterDelayStatus,
				setFilterOperationalStatus,
			},
			filters: {
				acceptance_status: filterAcceptanceStatus,
				agency: filterAgency,
				analysis_ended_at_last_stop: filterAnalysisEndedAtLastStop,
				analysis_expected_apex_validation_interval: filterAnalysisExpectedApexValidationInterval,
				analysis_simple_three_vehicle_events_grade: filterAnalysisSimpleThreeVehicleEvents,
				analysis_transaction_sequentiality: filterAnalysisTransactionSequentiality,
				date_end: filterDateEnd,
				date_start: filterDateStart,
				delay_status: filterDelayStatus,
				operational_status: filterOperationalStatus,
				search: initialFilters.search,
			},
			flags: {
				canSave: !!filterDateEnd && !!filterDateStart,
				error: undefined,
				loading: false,
			},
		};
	}, [
		filterDateEnd,
		filterDateStart,
		filterAcceptanceStatus,
		filterAgency,
		filterAnalysisEndedAtLastStop,
		filterAnalysisExpectedApexValidationInterval,
		filterAnalysisSimpleThreeVehicleEvents,
		filterAnalysisTransactionSequentiality,
		filterDelayStatus,
		filterOperationalStatus,
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
