'use client';

import { getAppConfig } from '@tmlmobilidade/lib';
/* * */

import { CreateFileExportDto, FileExport, type RideExportProperties, type UnixTimestamp } from '@tmlmobilidade/types';
import { useMeContext, useToast } from '@tmlmobilidade/ui';
import { Dates, fetchData } from '@tmlmobilidade/utils';
import { createContext, PropsWithChildren, useContext, useMemo, useState } from 'react';

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
	const me = useMeContext();

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

		const response = await fetchData<FileExport>(getAppConfig('auth', 'api_url') + '/file-exports', 'POST', createFileExportDto);

		if (response.error) {
			useToast.error({ message: response.error, title: 'Erro ao exportar circulações' });
			return;
		}

		useToast.success({ message: 'A exportação foi iniciada', title: 'Sucesso' });
		me.actions.mutateFileExports();
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
