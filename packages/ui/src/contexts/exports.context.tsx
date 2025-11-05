'use client';

/* * */

import { useToast } from '@/hooks/toast';
import { getAppConfig, HttpException } from '@go/lib';
import { CreateFileExportDto, FileExport, FileExportType } from '@go/types';
import { fetchData } from '@go/utils';
import { createContext, PropsWithChildren, useContext, useMemo } from 'react';
import useSWR from 'swr';

/* * */

interface ExportsContextState {
	actions: {
		create: <T extends { properties: Record<string, unknown>, type: FileExportType }>(dto: CreateFileExportDto<T>) => Promise<FileExport>
		download: (id: string) => Promise<void>
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
	const { data, error, isLoading, mutate } = useSWR<FileExport[], HttpException>(`${getAppConfig('auth', 'api_url')}/file-exports`);

	//
	// B. Transform data

	//
	// C. Handle actions

	async function create<T extends { properties: Record<string, unknown>, type: FileExportType }>(dto: CreateFileExportDto<T>): Promise<FileExport> {
		const response = await fetchData<FileExport>(`${getAppConfig('auth', 'api_url')}/file-exports`, 'POST', dto);

		if (response.error || !response.data) {
			throw new HttpException(response.statusCode, response.error ?? 'Failed to create file export');
		}

		mutate();

		return response.data;
	}

	async function download(id: string): Promise<void> {
		const url = await fetchData<string>(`${getAppConfig('auth', 'api_url')}/file-exports/${id}/download`, 'GET');
		if (url.error || !url.data) {
			useToast.error({ message: url.error ?? 'Failed to download file export' });
			return;
		}

		useToast.success({ message: 'File export downloaded successfully' });
		window.open(url.data, '_blank');
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
