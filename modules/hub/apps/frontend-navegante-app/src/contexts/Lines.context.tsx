'use client';

import { getPublicVariable } from '@/settings/public-variables';
import { type Line, type NetworkRoute } from '@/types/api/network';
import { createContext, useContext, useMemo } from 'react';
import useSWR from 'swr';

/* * */

interface LinesContextState {
	actions: {
		getLineDataById: (lineId: string) => Line | undefined
		getRouteDataById: (routeId: string) => NetworkRoute | undefined
	}
	data: {
		lines: Line[]
		routes: NetworkRoute[]
	}
	flags: {
		is_loading: boolean
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

export const LinesContextProvider = ({ children }) => {
	//

	//
	// A. Fetch data

	const { data: allLinesData, isLoading: allLinesLoading } = useSWR<Line[], Error>(`${getPublicVariable('hub_api_url')}/v1/network/lines`, { refreshInterval: 900000 }); // 15 minutes
	const { data: allRoutesData, isLoading: allRoutesLoading } = useSWR<NetworkRoute[], Error>(`${getPublicVariable('hub_api_url')}/v1/network/routes`, { refreshInterval: 900000 }); // 15 minutes

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

	const contextValue: LinesContextState = useMemo(() => ({
		actions: {
			getLineDataById,
			getRouteDataById,
		},
		data: {
			lines: normalizedLinesData,
			routes: normalizedRoutesData,
		},
		flags: {
			is_loading: allLinesLoading || allRoutesLoading,
		},
	}), [
		allLinesLoading,
		allRoutesLoading,
		normalizedLinesData,
		normalizedRoutesData,

	]);

	//
	// D. Render components

	return (
		<LinesContext.Provider value={contextValue}>
			{children}
		</LinesContext.Provider>
	);

	//
};
