'use client';

import { type HubRoute } from '@/types/api/network';
import { API_ROUTES } from '@tmlmobilidade/consts';
import { type HubLine } from '@tmlmobilidade/types';
import { createContext, type PropsWithChildren, useContext, useMemo } from 'react';
import useSWR from 'swr';

/* * */

interface LinesContextState {
	data: {
		lines: HubLine[]
		routes: HubRoute[]
	}
	flags: {
		error: Error | undefined
		isLoading: boolean
	}
}

/* * */

const LinesContext = createContext<LinesContextState | undefined>(undefined);

function getEntityId(entity: null | undefined | { _id?: string, id?: string }): string | undefined {
	if (!entity) return;
	if (typeof entity.id === 'string' && entity.id.length > 0) return entity.id;
	if (typeof entity._id === 'string' && entity._id.length > 0) return entity._id;
	return;
}

export function useLinesContext() {
	const context = useContext(LinesContext);
	if (!context) {
		throw new Error('useLinesContext must be used within a LinesContextProvider');
	}
	return context;
}

/* * */

export function LinesContextProvider({ children }: PropsWithChildren) {
	//

	//
	// A. Fetch data

	const { data: allLinesData, isLoading: allLinesLoading } = useSWR<HubLine[], Error>({ credentials: 'omit', url: API_ROUTES.hub.NETWORK_LINES });
	const { data: allRoutesData, isLoading: allRoutesLoading } = useSWR<HubRoute[], Error>({ credentials: 'omit', url: API_ROUTES.hub.NETWORK_ROUTES });

	const normalizedLinesData = useMemo(() => {
		return Array.isArray(allLinesData) ? allLinesData : [];
	}, [allLinesData]);

	const normalizedRoutesData = useMemo(() => {
		return Array.isArray(allRoutesData) ? allRoutesData : [];
	}, [allRoutesData]);

	//
	// B. Handle actions

	const getLineDataById = (lineId: string) => {
		if (!lineId) return;
		return normalizedLinesData.find((line) => {
			const normalizedLineId = getEntityId(line);
			if (!normalizedLineId) return false;
			return normalizedLineId === lineId;
		});
	};

	const getRouteDataById = (routeId: string) => {
		if (!routeId) return;
		return normalizedRoutesData.find((route) => {
			const normalizedRouteId = getEntityId(route);
			if (!normalizedRouteId) return false;
			return normalizedRouteId === routeId;
		});
	};

	//
	// C. Define context value

	const contextValue: LinesContextState = {
		data: {
			lines: normalizedLinesData,
			routes: normalizedRoutesData,
		},
		flags: {
			error: undefined,
			isLoading: allLinesLoading || allRoutesLoading,
		},
	};

	//
	// D. Render components

	return (
		<LinesContext.Provider value={contextValue}>
			{children}
		</LinesContext.Provider>
	);
};
