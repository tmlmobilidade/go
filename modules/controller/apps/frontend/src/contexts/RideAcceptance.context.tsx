'use client';

import { API_ROUTES } from '@tmlmobilidade/consts';
import { type AlertCause, type RideAcceptance } from '@tmlmobilidade/types';
import { useToast } from '@tmlmobilidade/ui';
import { fetchData } from '@tmlmobilidade/utils';
import { createContext, useContext, useMemo } from 'react';
import useSWR from 'swr';

/* * */

interface RideAcceptanceContextState {
	actions: {
		addComment: (comment: RideAcceptance['comments'][number]) => void
		changeStatus: (status: RideAcceptance['acceptance_status']) => void
		justify: (pto_message: string, justification_cause: AlertCause, manual_trip_id?: string) => void
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

const RideAcceptanceContext = createContext<RideAcceptanceContextState | undefined>(undefined);

export function useRideAcceptanceContext() {
	const context = useContext(RideAcceptanceContext);
	if (!context) {
		throw new Error('useRideAcceptanceContext must be used within a RideAcceptanceContextProvider');
	}
	return context;
}

/* * */

export const RideAcceptanceContextProvider = ({ children, rideId }) => {
	//

	//
	// A. Setup variables

	const { data: acceptanceData, error: acceptanceError, isLoading: acceptanceLoading, mutate: acceptanceMutate } = useSWR<RideAcceptance>(API_ROUTES.controller.ACCEPTANCE_DETAIL(rideId));

	//
	// B. Handle actions

	async function addComment(comment: RideAcceptance['comments'][number]) {
		try {
			const res = await fetchData(API_ROUTES.controller.ACCEPTANCE_COMMENT(rideId), 'POST', comment);

			if (res.error) {
				useToast.error({ message: res.error, title: 'Erro ao adicionar comentário' });
				return;
			}

			acceptanceMutate();
		}
		catch (error) {
			useToast.error({ message: error.message, title: 'Erro ao adicionar comentário' });
		}
	}

	async function changeStatus(status: RideAcceptance['acceptance_status']) {
		try {
			const statusResponse = await fetchData(API_ROUTES.controller.ACCEPTANCE_CHANGE_STATUS(rideId), 'PUT', { acceptance_status: status });

			if (statusResponse.error) {
				useToast.error({ message: statusResponse.error, title: 'Erro ao alterar status' });
				return;
			}

			acceptanceMutate();
		}
		catch (error) {
			useToast.error({ message: error.message, title: 'Erro ao alterar status' });
		}
	}

	async function justify(message: string, cause: AlertCause, manual_trip_id?: string) {
		const response = await fetchData(API_ROUTES.controller.ACCEPTANCE_JUSTIFY(rideId), 'PUT', { justification_cause: cause, manual_trip_id, pto_message: message });
		if (response.error) {
			useToast.error({ message: response.error, title: 'Erro ao justificar' });
			return;
		}
		acceptanceMutate();
	}

	async function toggleLock(is_locked: RideAcceptance['is_locked']) {
		const response = await fetchData(API_ROUTES.controller.ACCEPTANCE_LOCK(rideId), 'PUT', { is_locked });
		if (response.error) {
			useToast.error({ message: response.error, title: 'Erro ao bloquear justificação' });
			return;
		}
		acceptanceMutate();
	}

	//
	// C. Define context value

	const contextValue: RideAcceptanceContextState = useMemo(() => ({
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
		<RideAcceptanceContext.Provider value={contextValue}>
			{children}
		</RideAcceptanceContext.Provider>
	);

	//
};
