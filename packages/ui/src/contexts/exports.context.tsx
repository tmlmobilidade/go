'use client';

import { API_ROUTES, HttpException } from '@tmlmobilidade/consts';
import { CreateFileExportDto, FileExport, FileExportType } from '@tmlmobilidade/types';
import { fetchData } from '@tmlmobilidade/utils';
import { createContext, PropsWithChildren, useContext, useMemo } from 'react';
import useSWR from 'swr';

/* * */

interface ExportsContextState {
	actions: {
		create: <T extends { properties: Record<string, unknown>, type: FileExportType }>(dto: CreateFileExportDto<T>) => Promise<FileExport>
		download: (id: string) => void
		mutate: () => void
	}
	data: {
		fileExports: FileExport[]
	}
	flags: {
		error: HttpException | undefined
		loading: boolean
	}
}

/* * */

const ExportsContext = createContext<ExportsContextState | undefined>(undefined);

export function useExportsContext() {
	const context = useContext(ExportsContext);
	if (!context) {
		throw new Error('useExportsContext must be used within a ExportsContextProvider');
	}
	return context;
}

/* * */

export const ExportsContextProvider = ({ children }: PropsWithChildren) => {
	//

	//
	// A. Setup variables
	const { data, error, isLoading, mutate } = useSWR<FileExport[], HttpException>(API_ROUTES.exporter.EXPORTER_LIST);

	//
	// B. Transform data

	//
	// C. Handle actions

	async function create<T extends { properties: Record<string, unknown>, type: FileExportType }>(dto: CreateFileExportDto<T>): Promise<FileExport> {
		const response = await fetchData<FileExport>(API_ROUTES.exporter.EXPORTER_LIST, 'POST', dto);

		if (response.error || !response.data) {
			throw new HttpException(response.statusCode, response.error ?? 'Failed to create file export');
		}

		mutate();

		return response.data;
	}

	function download(id: string): void {
		window.location.href = API_ROUTES.exporter.EXPORTER_DETAIL_DOWNLOAD(id);
	}

	//
	// D. Define context value

	const contextValue: ExportsContextState = useMemo(() => {
		return {
			actions: {
				create,
				download,
				mutate,
			},
			data: {
				fileExports: data || [],
			},
			flags: {
				error,
				loading: isLoading,
			},
		};
	}, [data, error, isLoading]);

	//
	// E. Render components

	return (
		<ExportsContext.Provider value={contextValue}>
			{children}
		</ExportsContext.Provider>
	);

	//
};
