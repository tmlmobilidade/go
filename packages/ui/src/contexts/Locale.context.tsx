'use client';

import '@tmlmobilidade/ui';
import i18next from 'i18next';
import { createContext, type PropsWithChildren, useCallback, useContext, useEffect, useMemo, useState } from 'react';

import { DEFAULT_LOCALE_CODE, getBrowserLocale, getMatchingLocale } from '../i18n/locales';
import { registerModuleTranslations } from '../i18n/utils';

/* * */

export interface LocaleContextProps {
	i18n?: {
		es: object
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

	const [locale, setLocaleState] = useState<string>(DEFAULT_LOCALE_CODE);

	useEffect(() => {
		setLocaleState(getBrowserLocale());
	}, []);

	//
	// B. Transform Data

	useEffect(() => {
		i18next.changeLanguage(locale);
	}, [locale]);

	useEffect(() => {
		if (!i18n) return;
		for (const [localeCode, namespaces] of Object.entries(i18n)) {
			for (const [namespace, value] of Object.entries(namespaces)) {
				registerModuleTranslations(namespace, { [localeCode]: value });
			}
		}
	}, [i18n]);

	const setLocale = useCallback((localeCode: string) => {
		const matchingLocale = getMatchingLocale(localeCode);
		setLocaleState(matchingLocale?._id ?? DEFAULT_LOCALE_CODE);
	}, []);

	//
	// C. Context value

	const contextValue: LocaleContextState = useMemo(() => ({
		actions: {
			setLocale,
		},
		data: {
			locale,
		},
	}), [locale, setLocale]);

	//
	// D. Render components

	return (
		<LocaleContext.Provider value={contextValue}>
			{children}
		</LocaleContext.Provider>
	);

	//
};
