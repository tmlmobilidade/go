'use client';

/* * */

import { OPERATORS, OperatorType } from '@/constants';
import { createContext, useContext, useState } from 'react';

/* * */

interface HomeContextState {
	actions: {
		setSelectedOperator: (operator: null | string) => void
	}
	data: {
		selected_operator: null | OperatorType
	}
	flags: {
		is_loading: boolean
	}
}

/* * */

const HomeContext = createContext<HomeContextState | undefined>(undefined);

export function useHomeContext() {
	const context = useContext(HomeContext);
	if (!context) {
		throw new Error('useHomeContext must be used within a HomeContextProvider');
	}

	return context;
}

/* * */

export const HomeContextProvider = ({ children }: { children: React.ReactNode }) => {
	//

	//
	// A. Setup state

	const [selectedOperator, setSelectedOperator] = useState<null | OperatorType>(OPERATORS.ALL);

	//
	// A. Define actions

	const changeSelectedOperator = (operator: null | OperatorType) => {
		setSelectedOperator(operator);
	};

	//
	// D. Define context value

	const contextValue: HomeContextState = {
		actions: {
			setSelectedOperator: changeSelectedOperator,
		},
		data: {
			selected_operator: selectedOperator,
		},
		flags: {
			is_loading: false,
		},
	};

	//
	// E. Render components

	return (
		<HomeContext.Provider value={contextValue}>
			{children}
		</HomeContext.Provider>
	);

	//
};
