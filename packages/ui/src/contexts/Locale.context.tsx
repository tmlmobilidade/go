'use client';
/* * */

import i18next from 'i18next';
import { createContext, type PropsWithChildren, useContext, useEffect, useMemo, useState } from 'react';

/* * */

interface LocaleContextState {
	data: {
		locale: string
	}
	actions:{
		setLocale: (locale: string) => void
	}
}

/* * */

const LocaleContext = createContext<LocaleContextState | undefined>(undefined);

export function useLocaleContext() {
	const context = useContext(LocaleContext);
	if (!context) {
		throw new Error('useLocaleContext must be used within a LocaleContextProvider');
	}
	return context;
}

/* * */

export const LocaleContextProvider = ({ children }: PropsWithChildren) => {
	//
	//

	//
	// A. Setup Variables
	
	const [locale, setLocale] = useState<string, undefined>(undefined);

	//
	//B. Transform Data

	useEffect(() => {
		if (typeof window === 'undefined') return;
			const browserLocales = navigator.languages ? navigator.languages : [navigator.language];
			const lang = browserLocales[0] || 'pt';
			setLocale(lang.split('-')[0]);
	}, [])

	useEffect(() => {
		i18next.changeLanguage(locale);
	}, [locale]);

	//
	// C. Context value

	const contextValue: LocaleContextState = useMemo(() => ({
		data: {
			locale,
		},
		actions:{
			setLocale,
		}
	}), [locale]);

	//
	// D. Render components

	return (
		<LocaleContext.Provider value={contextValue}>
			{children}
		</LocaleContext.Provider>
	);

	//
};
