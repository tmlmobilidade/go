'use client';

import { LocaleContextProvider } from '@/contexts/Locale.context';

/* * */

export function RootProviders({ children }) {
	return (
		<LocaleContextProvider>
			{children}
		</LocaleContextProvider>
	);
}
