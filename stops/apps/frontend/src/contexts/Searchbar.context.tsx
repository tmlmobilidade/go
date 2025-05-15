'use client';

import { createContext, useContext, useState } from 'react';

/* Context Interface */

interface SearchbarContextState {
	queryString: null | string
	setQueryString: React.Dispatch<React.SetStateAction<null | string>>
}

/* Context Definition */

const SearchbarContext = createContext<SearchbarContextState | undefined>(undefined);

/* Context Usage */

export function useSearchbarContext() {
	const context = useContext(SearchbarContext);
	if (!context) {
		throw new Error('useSearchbarContext must be used within a SearchbarContextProvider');
	}
	return context;
}

/* Context Provider */

export const SearchbarContextProvider = ({ children }: { children: React.ReactNode }) => {
	const [queryString, setQueryString] = useState<string>(null);

	return (
		<SearchbarContext.Provider value={{ queryString, setQueryString }}>
			{children}
		</SearchbarContext.Provider>
	);
};
