'use client';

import { useLinesContext } from '@/components/lines/Lines.context';
import { useTransitModes } from '@/hooks/use-transit-modes';
import { type HubLine } from '@tmlmobilidade/types';
import { type ListContextStateTemplate, useFilterStateString, useSearch } from '@tmlmobilidade/ui';
import { createContext, type PropsWithChildren, useContext, useMemo } from 'react';

/* * */

interface LinesListContextState extends ListContextStateTemplate {
	data: {
		filtered: HubLine[]
	}
}

/* * */

const LinesListContext = createContext<LinesListContextState | undefined>(undefined);

export function useLinesListContext() {
	const context = useContext(LinesListContext);
	if (!context) {
		throw new Error('useLinesListContext must be used within a LinesListContextProvider');
	}
	return context;
}

/* * */

export const LinesListContextProvider = ({ children }: PropsWithChildren) => {
	//

	//
	// A. Setup variables

	const linesContext = useLinesContext();

	const { activeAgencyIds } = useTransitModes();

	const filterSearch = useFilterStateString('search');

	//
	// B. Transform data

	const searchResultsData = useSearch<HubLine>({
		accessors: ['long_name', 'short_name', 'tts_name'],
		data: linesContext.data.lines,
		query: filterSearch.value,
	});

	const filteredData = useMemo(() => {
		return searchResultsData?.filter((line) => {
			return activeAgencyIds.includes(line.agency_id);
		});
	}, [searchResultsData, activeAgencyIds]);

	//
	// C. Define context value

	const contextValue: LinesListContextState = {
		data: {
			filtered: filteredData,
		},
		filters: {
			search: filterSearch,
		},
		flags: {
			error: undefined,
			isLoading: linesContext.flags.isLoading,
		},
	};

	//
	// D. Render components

	return (
		<LinesListContext.Provider value={contextValue}>
			{children}
		</LinesListContext.Provider>
	);

	//
};
