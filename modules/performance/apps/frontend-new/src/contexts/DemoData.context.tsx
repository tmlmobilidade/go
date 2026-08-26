'use client';

/* * */

import { parseAsBoolean, useQueryState } from '@tmlmobilidade/ui';
import { createContext, type PropsWithChildren, useContext, useState } from 'react';

/* * */

interface DemoDataContextState {
	actions: {
		refresh: () => void
		setEnabled: (enabled: boolean) => void
		toggle: () => void
	}
	data: {
		refresh_index: number
	}
	flags: {
		is_enabled: boolean
	}
}

/* * */

const DemoDataContext = createContext<DemoDataContextState | undefined>(undefined);

/* * */

export function useDemoDataContext() {
	const context = useContext(DemoDataContext);
	if (!context) throw new Error('useDemoDataContext must be used within a DemoDataContextProvider');
	return context;
}

/* * */

export function DemoDataContextProvider({ children }: PropsWithChildren) {
	//

	//
	// A. Setup variables

	const [isEnabled, setIsEnabled] = useQueryState('demo', parseAsBoolean.withDefault(false));
	const [refreshIndex, setRefreshIndex] = useState(0);

	//
	// B. Render components

	return (
		<DemoDataContext.Provider
			value={{
				actions: {
					refresh: () => setRefreshIndex(current => current + 1),
					setEnabled: enabled => void setIsEnabled(enabled ? true : null),
					toggle: () => void setIsEnabled(isEnabled ? null : true),
				},
				data: { refresh_index: refreshIndex },
				flags: { is_enabled: isEnabled },
			}}
		>
			{children}
		</DemoDataContext.Provider>
	);

	//
}
