'use client';

import { API_ROUTES, HttpException } from '@tmlmobilidade/consts';
import { useFileExportsListData } from '@tmlmobilidade/go-exporter-pckg-frontend';
import { type CreateFileExportDto, type FileExport, type FileExportType } from '@tmlmobilidade/go-types-downloads';
import { fetchData } from '@tmlmobilidade/utils';
import { createContext, PropsWithChildren, useCallback, useContext, useMemo } from 'react';

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
	// B. Transform data

	//
	// C. Handle actions

	const create = useCallback(async <T extends { properties: Record<string, unknown>, type: FileExportType }>(dto: CreateFileExportDto<T>): Promise<FileExport> => {
		const response = await fetchData<FileExport>(API_ROUTES.exporter.EXPORTER_CREATE, 'POST', dto);

		if (response.error || !response.data) {
			throw new HttpException(response.statusCode, response.error ?? 'Failed to create file export');
		}

		mutate();

		return response.data;
	}, [mutate]);

	const download = useCallback((id: string): void => {
		window.location.href = API_ROUTES.exporter.EXPORTER_DETAIL_DOWNLOAD(id);
	}, []);

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
				fileExports,
			},
			flags: {
				error,
				loading: isLoading,
			},
		};
	}, [create, download, error, fileExports, isLoading, mutate]);

	//
	// E. Render components

	return (
		<ExportsContext.Provider value={contextValue}>
			{children}
		</ExportsContext.Provider>
	);

	//
};
