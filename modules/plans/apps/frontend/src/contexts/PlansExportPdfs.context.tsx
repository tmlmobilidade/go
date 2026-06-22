'use client';

import { API_ROUTES } from '@tmlmobilidade/consts';
import { useHandleUpdate } from '@tmlmobilidade/ui';
import { fetchData } from '@tmlmobilidade/utils';
import { createContext, PropsWithChildren, useContext, useMemo } from 'react';

/* * */

interface PlansExportPdfsContextState {
	actions: {
		generatePosters: () => Promise<void>
	}
	flags: {
		has_error: boolean
		is_generating: boolean
	}
}

/* * */

interface PlansExportPdfsResponse {
	success: boolean
}

/* * */

const PlansExportPdfsContext = createContext<PlansExportPdfsContextState | undefined>(undefined);

export function usePlansExportPdfsContext() {
	const context = useContext(PlansExportPdfsContext);
	if (!context) {
		throw new Error('usePlansExportPdfsContext must be used within a PlansExportPdfsContextProvider');
	}
	return context;
}

/* * */

export const PlansExportPdfsContextProvider = ({ children, planId }: PropsWithChildren<{ planId: string }>) => {
	//

	//
	// A. Handle actions

	const { action: generatePosters, isError, isLoading } = useHandleUpdate<PlansExportPdfsResponse>({
		fetchFn: async () => await fetchData<PlansExportPdfsResponse>(API_ROUTES.plans.PLANS_DETAIL_LIST_TO_GENERATE_POSTERS(planId), 'PUT', {}),
		labels: {
			error_message: 'Não foi possível processar o plano para gerar os posters PDF.',
			error_title: 'Erro ao gerar posters',
			success_message: 'A processar o plano para gerar os posters PDF. Aguarde alguns minutos para que os posters sejam gerados.',
			success_title: 'Processando plano',
		},
		onSuccess: () => {},
	});

	//
	// B. Define context value

	const contextValue: PlansExportPdfsContextState = useMemo(() => ({
		actions: {
			generatePosters,
		},
		flags: {
			has_error: Boolean(isError),
			is_generating: isLoading,
		},
	}), [generatePosters, isError, isLoading]);

	//
	// C. Render components

	return (
		<PlansExportPdfsContext.Provider value={contextValue}>
			{children}
		</PlansExportPdfsContext.Provider>
	);

	//
};
