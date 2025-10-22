'use client';

/* * */

import { CreateFileExportDto, type RideExportProperties, type UnixTimestamp } from '@tmlmobilidade/types';
import { closeModal, useExportsContext, useToast } from '@tmlmobilidade/ui';
import { Dates } from '@tmlmobilidade/utils';
import { createContext, PropsWithChildren, useContext, useMemo, useState } from 'react';

import { RIDES_EXPORT_MODAL_ID } from '.';

/* * */

interface RidesExportModalContextState {
	actions: {
		exportRides: () => void
		onEndDateChange: (date: UnixTimestamp) => void
		onStartDateChange: (date: UnixTimestamp) => void
	}
	data: {
		endDate: undefined | UnixTimestamp
		startDate: undefined | UnixTimestamp
	}
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

export const RidesExportModalContextProvider = ({ children }: PropsWithChildren) => {
	//

	//
	// A. Setup variables
	const [endDate, setEndDate] = useState<undefined | UnixTimestamp>(undefined);
	const [startDate, setStartDate] = useState<undefined | UnixTimestamp>(undefined);
	const exports = useExportsContext();

	//
	// B. Transform data

	//
	// C. Handle actions
	async function exportRides() {
		if (!startDate || !endDate) return;

		const fileName = `${Dates.fromUnixTimestamp(startDate).setZone('Europe/Lisbon', 'offset_only').operational_date}->${Dates.fromUnixTimestamp(endDate).setZone('Europe/Lisbon', 'offset_only').operational_date}.csv`;
		const createFileExportDto: CreateFileExportDto<RideExportProperties> = {
			file_name: fileName,
			processing_status: 'waiting',
			properties: {
				end_date: endDate,
				start_date: startDate,
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
				onEndDateChange: setEndDate,
				onStartDateChange: setStartDate,
			},
			data: {
				endDate,
				startDate,
			},
			flags: {
				canSave: !!endDate && !!startDate,
				error: undefined,
				loading: false,
			},
		};
	}, [endDate, startDate]);

	//
	// E. Render components

	return (
		<RidesExportModalContext.Provider value={contextValue}>
			{children}
		</RidesExportModalContext.Provider>
	);

	//
};
