'use client';

import { API_ROUTES, HttpException } from '@tmlmobilidade/consts';
import { useFileExportsListData } from '@tmlmobilidade/go-exporter-pckg-frontend';
import { type CreateFileExportDto, type FileExport, type FileExportType } from '@tmlmobilidade/go-types-downloads';
import { createContext, type PropsWithChildren, useCallback, useContext, useMemo } from 'react';

import { fetchApiData } from '../fetch/fetch-api-data';

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
		error: null | string
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

	const {
		data: fileExports,
		error,
		isLoading,
		mutate,
	} = useFileExportsListData();

	//
	// B. Handle actions

	const create = useCallback(async <T extends { properties: Record<string, unknown>, type: FileExportType }>(dto: CreateFileExportDto<T>): Promise<FileExport> => {
		const response = await fetchApiData<FileExport, CreateFileExportDto<T>>({
			body: dto,
			method: 'POST',
			url: API_ROUTES.exporter.EXPORTER_CREATE,
		});

		if (response.error || !response.data) {
			throw new HttpException(Number(response.status_code), response.error ?? 'Failed to create file export');
		}

		mutate();

		return response.data;
	}, [mutate]);

	const download = useCallback((id: string): void => {
		window.location.href = API_ROUTES.exporter.EXPORTER_DETAIL_DOWNLOAD(id);
	}, []);

	//
	// C. Define context value

	const contextValue: ExportsContextState = useMemo(() => {
		return {
			actions: {
				create,
				download,
				mutate,
			},
			data: {
				fileExports,
			},
			flags: {
				error,
				loading: isLoading,
			},
		};
	}, [create, download, error, fileExports, isLoading, mutate]);

	//
	// D. Render components

	return (
		<ExportsContext.Provider value={contextValue}>
			{children}
		</ExportsContext.Provider>
	);

	//
};
