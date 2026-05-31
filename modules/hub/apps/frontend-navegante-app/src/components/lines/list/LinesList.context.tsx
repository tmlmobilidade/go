'use client';

import { useLinesContext } from '@/contexts/Lines.context';
import { type HubLine } from '@tmlmobilidade/types';
import { type ListContextStateTemplate, useFilterStateString, useSearch } from '@tmlmobilidade/ui';
import { createContext, type PropsWithChildren, useContext } from 'react';

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

	const filterSearch = useFilterStateString('search');

	//
	// C. Transform data

	const searchResultsData = useSearch<HubLine>({
		accessors: ['long_name', 'short_name', 'tts_name'],
		data: linesContext.data.lines,
		query: filterSearch.value,
	});

	//
	// E. Define context value

	const contextValue: LinesListContextState = {
		data: {
			filtered: searchResultsData,
		},
		filters: {
			search: filterSearch,
		},
		flags: {
			error: undefined,
			isLoading: linesContext.flags.is_loading,
		},
	};

	//
	// F. Render components

	return (
		<LinesListContext.Provider value={contextValue}>
			{children}
		</LinesListContext.Provider>
	);

	//
};
