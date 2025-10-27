'use client';

/* * */

import { RidesListContextState } from '@/contexts/RidesList.context';
import { CreateFileExportDto, type RideExportProperties, type UnixTimestamp } from '@tmlmobilidade/types';
import { closeModal, useExportsContext, useToast } from '@tmlmobilidade/ui';
import { Dates } from '@tmlmobilidade/utils';
import { createContext, PropsWithChildren, useContext, useMemo, useState } from 'react';

import { RIDES_EXPORT_MODAL_ID } from '.';

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
			file_name: fileName,
			processing_status: 'waiting',
			properties: {
				acceptance_statuses: filterAcceptanceStatus,
				agency_ids: filterAgency,
				analysis_ended_at_last_stop_grade: filterAnalysisEndedAtLastStop,
				analysis_expected_apex_validation_interval: filterAnalysisExpectedApexValidationInterval,
				analysis_simple_three_vehicle_events_grade: filterAnalysisSimpleThreeVehicleEvents,
				analysis_transaction_sequentiality: filterAnalysisTransactionSequentiality,
				delay_statuses: filterDelayStatus,
				end_date: filterDateEnd as UnixTimestamp,
				operational_statuses: filterOperationalStatus,
				start_date: filterDateStart as UnixTimestamp,
			},
			type: 'ride',
		};

		exports.actions.create(createFileExportDto);
		useToast.success({ message: 'A exportação foi iniciada', title: 'Sucesso' });
		closeModal(RIDES_EXPORT_MODAL_ID);
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
