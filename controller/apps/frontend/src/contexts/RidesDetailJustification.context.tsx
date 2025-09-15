'use client';

import { type CreateCommentDto, type RideJustification } from '@tmlmobilidade/types';
import { useToast } from '@tmlmobilidade/ui';
import { fetchData } from '@tmlmobilidade/utils';
import { createContext, useContext, useMemo } from 'react';
import useSWR, { mutate } from 'swr';

/* * */

/* * */

interface RidesDetailJustificationContextState {
	actions: {
		addComment: (comment: CreateCommentDto) => void
		changeStatus: (status: RideJustification['acceptance_status']) => void
		justify: (message: RideJustification['pto_message']) => void
		toggleLock: (is_locked: RideJustification['is_locked']) => void
	}
	data: {
		justification: null | RideJustification
	}
	flags: {
		error: Error | null
		loading: boolean
	}
}

/* * */

const RidesDetailJustificationContext = createContext<RidesDetailJustificationContextState | undefined>(undefined);

export function useRidesDetailJustificationContext() {
	const context = useContext(RidesDetailJustificationContext);
	if (!context) {
		throw new Error('useRidesDetailJustificationContext must be used within a RidesDetailJustificationContextProvider');
	}
	return context;
}

/* * */

const BASE_URL = (trip_id: string) => `/rides/${trip_id}/justification`;
export const RidesDetailJustificationContextProvider = ({ children, trip_id }) => {
	//

	//
	// A. Setup variables
	const { data: justificationData, error: justificationError, isLoading: justificationLoading } = useSWR<RideJustification>(BASE_URL(trip_id));

	//
	// B. Transform data

	//
	// C. Handle actions
	async function addComment(comment: CreateCommentDto) {
		try {
			const res = await fetchData(BASE_URL(trip_id), 'POST', comment);

			if (res.error) {
				useToast.error({ message: res.error, title: 'Erro ao adicionar comentário' });
				return;
			}

			mutate(BASE_URL(trip_id));
		}
		catch (error) {
			useToast.error({ message: error.message, title: 'Erro ao adicionar comentário' });
		}
	}

	//
	async function changeStatus(status: RideJustification['acceptance_status']) {
		try {
			const statusResponse = await fetchData(BASE_URL(trip_id), 'PUT', { acceptance_status: status });

			if (statusResponse.error) {
				useToast.error({ message: statusResponse.error, title: 'Erro ao alterar status' });
				return;
			}

			mutate(BASE_URL(trip_id));
		}
		catch (error) {
			useToast.error({ message: error.message, title: 'Erro ao alterar status' });
		}
	}

	function justify(message: RideJustification['pto_message']) {
		const response = fetchData(BASE_URL(trip_id), 'PUT', { pto_message: message });
		console.log('justify', response);
	}

	//
	async function toggleLock(is_locked: RideJustification['is_locked']) {
		const response = fetchData(BASE_URL(trip_id), 'PUT', { is_locked });
		console.log('toggleLock', response);
	}

	// D. Define context value

	const contextValue: RidesDetailJustificationContextState = useMemo(() => ({
		actions: {
			addComment,
			changeStatus,
			justify,
			toggleLock,
		},
		data: {
			justification: justificationData,
		},
		flags: {
			error: justificationError,
			loading: justificationLoading,
		},
	}), [
		justificationData,
		justificationError,
		justificationLoading,
	]);

	//
	// D. Render components

	return (
		<RidesDetailJustificationContext.Provider value={contextValue}>
			{children}
		</RidesDetailJustificationContext.Provider>
	);

	//
};
