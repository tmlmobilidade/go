'use client';

import '@tmlmobilidade/ui';
import i18next from 'i18next';
import { createContext, type PropsWithChildren, useContext, useEffect, useMemo, useState } from 'react';

import { registerModuleTranslations } from '../i18n/utils';

/* * */

export interface LocaleContextProps {
	i18n?: {
		pt: object
	}
};

interface LocaleContextState {
	actions: {
		setLocale: (locale: string) => void
	}
	data: {
		locale: string
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

export const LocaleContextProvider = ({ children, i18n }: PropsWithChildren<LocaleContextProps>) => {
	//
	//

	//
	// A. Setup Variables

	const [locale, setLocale] = useState<string | undefined>(undefined);

	//
	// B. Transform Data

	useEffect(() => {
		if (typeof window === 'undefined') return;
		const browserLocales = navigator.languages ? navigator.languages : [navigator.language];
		const lang = browserLocales[0] || 'pt';
		setLocale(lang.split('-')[0]);
	}, []);

	useEffect(() => {
		i18next.changeLanguage(locale);
	}, [locale]);

	useEffect(() => {
		if (!i18n) return;
		for (const [key, value] of Object.entries(i18n.pt)) {
			registerModuleTranslations(key, { pt: value });
		}
	}, [i18n]);

	//
	// C. Context value

	const contextValue: LocaleContextState = useMemo(() => ({
		actions: {
			setLocale,
		},
		data: {
			locale,
		},
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
