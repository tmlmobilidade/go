'use client';

import { GtfsCause, type RideAcceptance } from '@tmlmobilidade/types';
import { useToast } from '@tmlmobilidade/ui';
import { fetchData } from '@tmlmobilidade/utils';
import { createContext, useContext, useMemo } from 'react';
import useSWR, { mutate } from 'swr';

/* * */

/* * */

interface RidesDetailAcceptanceContextState {
	actions: {
		addComment: (comment: RideAcceptance['comments'][number]) => void
		changeStatus: (status: RideAcceptance['acceptance_status']) => void
		justify: (pto_message: string, justification_cause: GtfsCause) => void
		toggleLock: (is_locked: RideAcceptance['is_locked']) => void
	}
	data: {
		acceptance: null | RideAcceptance
	}
	flags: {
		error: Error | null
		loading: boolean
	}
}

/* * */

const RidesDetailAcceptanceContext = createContext<RidesDetailAcceptanceContextState | undefined>(undefined);

export function useRidesDetailAcceptanceContext() {
	const context = useContext(RidesDetailAcceptanceContext);
	if (!context) {
		throw new Error('useRidesDetailAcceptanceContext must be used within a RidesDetailAcceptanceContextProvider');
	}
	return context;
}

/* * */

const BASE_URL = (rideId: string) => `/api/rides/${rideId}/acceptance`;
export const RidesDetailAcceptanceContextProvider = ({ children, rideId }) => {
	//

	//
	// A. Setup variables
	const { data: acceptanceData, error: acceptanceError, isLoading: acceptanceLoading } = useSWR<RideAcceptance>(BASE_URL(rideId));

	//
	// C. Handle actions
	async function addComment(comment: RideAcceptance['comments'][number]) {
		try {
			const res = await fetchData(BASE_URL(rideId) + '/comment', 'POST', comment);

			if (res.error) {
				useToast.error({ message: res.error, title: 'Erro ao adicionar comentário' });
				return;
			}

			mutate(BASE_URL(rideId));
		}
		catch (error) {
			useToast.error({ message: error.message, title: 'Erro ao adicionar comentário' });
		}
	}

	//
	async function changeStatus(status: RideAcceptance['acceptance_status']) {
		try {
			const statusResponse = await fetchData(BASE_URL(rideId) + '/change-status', 'PUT', { acceptance_status: status });

			if (statusResponse.error) {
				useToast.error({ message: statusResponse.error, title: 'Erro ao alterar status' });
				return;
			}

			mutate(BASE_URL(rideId));
		}
		catch (error) {
			useToast.error({ message: error.message, title: 'Erro ao alterar status' });
		}
	}

	async function justify(message: string, cause: GtfsCause) {
		const response = await fetchData(BASE_URL(rideId) + '/justify', 'PUT', { justification_cause: cause, pto_message: message });
		if (response.error) {
			useToast.error({ message: response.error, title: 'Erro ao justificar' });
			return;
		}

		mutate(BASE_URL(rideId));
	}

	//
	async function toggleLock(is_locked: RideAcceptance['is_locked']) {
		const response = await fetchData(BASE_URL(rideId), 'PUT', { is_locked });
		if (response.error) {
			useToast.error({ message: response.error, title: 'Erro ao bloquear justificação' });
			return;
		}

		mutate(BASE_URL(rideId));
	}

	// D. Define context value

	const contextValue: RidesDetailAcceptanceContextState = useMemo(() => ({
		actions: {
			addComment,
			changeStatus,
			justify,
			toggleLock,
		},
		data: {
			acceptance: acceptanceData,
		},
		flags: {
			error: acceptanceError,
			loading: acceptanceLoading,
		},
	}), [
		acceptanceData,
		acceptanceError,
		acceptanceLoading,
	]);

	//
	// D. Render components

	return (
		<RidesDetailAcceptanceContext.Provider value={contextValue}>
			{children}
		</RidesDetailAcceptanceContext.Provider>
	);

	//
};
