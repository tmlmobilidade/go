'use client';

import { availableFormats, DEFAULT_LOCALE_CODE, defaultLocale, enabledLocales, getMatchingLocale, LOCALE_STORAGE_KEY } from '@/i18n/config';
import { useLocalStorage, useQueryState } from '@tmlmobilidade/ui';
import { NextIntlClientProvider } from 'next-intl';
import { createContext, type PropsWithChildren, useContext, useEffect, useMemo } from 'react';

/* * */

interface LocaleContextState {
	actions: {
		setCurrentLocale: (localeCode: string) => void
	}
	data: {
		current_locale: string
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
	// A. Setup variables

	const [currentLocale, setCurrentLocale] = useLocalStorage<string>({ defaultValue: DEFAULT_LOCALE_CODE, key: LOCALE_STORAGE_KEY });

	const [currentLocaleQueryParam, setCurrentLocaleQueryParam] = useQueryState(LOCALE_STORAGE_KEY);

	const currentTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;

	//
	// B. Transform data

	const currentLocaleMessages = useMemo(() => {
		const matchingLocale = enabledLocales.find(item => item._id === currentLocale || item.alias.includes(currentLocale));
		if (matchingLocale) return matchingLocale.messages;
		else return defaultLocale.messages;
	}, [currentLocale]);

	//
	// C. Handle actions

	useEffect(() => {
		// Ensure a valid locale is always set
		const matchingLocale = getMatchingLocale(currentLocale);
		// Exit if a match is found
		if (matchingLocale) return;
		// If no match is found, set the default locale
		setCurrentLocale(defaultLocale._id);
	}, [currentLocale, setCurrentLocale]);

	useEffect(() => {
		// Exit if no query param is set
		if (!currentLocaleQueryParam) return;
		// Try to match the query param value with an enabled locale
		const matchingLocale = getMatchingLocale(currentLocaleQueryParam);
		// If a match is found, set the current locale to the query param value
		if (matchingLocale) setCurrentLocale(currentLocaleQueryParam);
		// Clear the query param to avoid infinite loop
		setCurrentLocaleQueryParam(null);
	}, [currentLocaleQueryParam, setCurrentLocale, setCurrentLocaleQueryParam]);

	//
	// D. Define context value

	const contextValue: LocaleContextState = {
		actions: {
			setCurrentLocale,
		},
		data: {
			current_locale: currentLocale,
		},
	};

	//
	// E. Render components

	return (
		<LocaleContext.Provider value={contextValue}>
			<NextIntlClientProvider
				formats={availableFormats}
				locale={currentLocale}
				messages={currentLocaleMessages}
				timeZone={currentTimeZone ?? 'Europe/Lisbon'}
			>
				{children}
			</NextIntlClientProvider>
		</LocaleContext.Provider>
	);

	//
};
