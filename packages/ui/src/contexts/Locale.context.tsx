'use client';

import { type Resource } from 'i18next';
import { createContext, type PropsWithChildren, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { I18nextProvider } from 'react-i18next';

import { createI18nInstance } from '../i18n/config';
import { DEFAULT_LOCALE_CODE, getBrowserLocale, getMatchingLocale } from '../i18n/locales';

/* * */

export interface LocaleContextProps {
	i18n?: Resource
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

	const [i18nInstance] = useState(() => createI18nInstance(i18n));
	const [locale, setLocaleState] = useState<string>(DEFAULT_LOCALE_CODE);

	useEffect(() => {
		setLocaleState(getBrowserLocale());
	}, []);

	//
	// B. Transform Data

	useEffect(() => {
		void i18nInstance.changeLanguage(locale);
	}, [i18nInstance, locale]);

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
		<I18nextProvider i18n={i18nInstance}>
			<LocaleContext.Provider value={contextValue}>
				{children}
			</LocaleContext.Provider>
		</I18nextProvider>
	);

	//
};
