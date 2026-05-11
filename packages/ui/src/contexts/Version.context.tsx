'use client';

import { createContext, type PropsWithChildren, useContext } from 'react';

/* * */

export interface VersionContextProps {
	version: string
};

interface VersionContextState {
	data: {
		version: string
	}
}

/* * */

const VersionContext = createContext<undefined | VersionContextState>(undefined);

export const useVersionContext = () => {
	const context = useContext(VersionContext);
	if (!context) {
		throw new Error('useVersionContext must be used within a VersionContextProvider');
	}
	return context;
};

/* * */

export function VersionContextProvider({ children, version }: PropsWithChildren<VersionContextProps>) {
	//
	//

	//
	// A. Context value

	const contextValue: VersionContextState = {
		data: {
			version,
		},
	};

	//
	// B. Render components

	return (
		<VersionContext.Provider value={contextValue}>
			{children}
		</VersionContext.Provider>
	);

	//
};
