'use client';

import { availableFormats, DEFAULT_LOCALE_CODE, defaultLocale, getMatchingLocale, LOCALE_STORAGE_KEY } from '@/i18n/config';
import { useLayoutContext, useLocalStorage, useMeContext, useQueryState } from '@tmlmobilidade/ui';
import { NextIntlClientProvider } from 'next-intl';
import { createContext, type PropsWithChildren, useCallback, useContext, useEffect, useMemo, useRef } from 'react';

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

	const layoutContext = useLayoutContext();
	const meContext = useMeContext();
	const { activateLocale } = layoutContext.actions;
	const savedLocalePreference = meContext.actions.getPreference<string>('ui', 'active_locale');
	const [legacyLocale] = useLocalStorage<string>({ defaultValue: '', getInitialValueInEffect: false, key: LOCALE_STORAGE_KEY });
	const [currentLocaleQueryParam, setCurrentLocaleQueryParam] = useQueryState(LOCALE_STORAGE_KEY);
	const hasMigratedLegacyLocale = useRef(false);
	const currentTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;

	//
	// B. Transform data

	const matchingLocale = getMatchingLocale(layoutContext.data.active_locale) ?? defaultLocale;
	const currentLocale = matchingLocale._id;
	const currentLocaleMessages = matchingLocale.messages;

	//
	// C. Handle actions

	const setCurrentLocale = useCallback((localeCode: string) => {
		activateLocale(getMatchingLocale(localeCode)?._id ?? DEFAULT_LOCALE_CODE);
	}, [activateLocale]);

	useEffect(() => {
		if (currentLocaleQueryParam) {
			const queryLocale = getMatchingLocale(currentLocaleQueryParam);
			if (queryLocale) {
				activateLocale(queryLocale._id);
				hasMigratedLegacyLocale.current = true;
			} else console.warn(`Invalid locale query param: ${currentLocaleQueryParam}`);
			setCurrentLocaleQueryParam(null);
			return;
		}

		if (hasMigratedLegacyLocale.current) return;
		hasMigratedLegacyLocale.current = true;
		// Keep an existing Performance preference when no shared preference is saved.
		if (savedLocalePreference != null) return;
		const storedLocale = getMatchingLocale(legacyLocale);
		if (storedLocale) activateLocale(storedLocale._id);
	}, [activateLocale, currentLocaleQueryParam, legacyLocale, savedLocalePreference, setCurrentLocaleQueryParam]);

	//
	// D. Define context value

	const contextValue: LocaleContextState = useMemo(() => ({
		actions: {
			setCurrentLocale,
		},
		data: {
			current_locale: currentLocale,
		},
	}), [currentLocale, setCurrentLocale]);

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
