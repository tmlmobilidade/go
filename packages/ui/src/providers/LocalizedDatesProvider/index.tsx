'use client';

import { DatesProvider, type DatesProviderSettings } from '@mantine/dates';
import { type PropsWithChildren } from 'react';

import { useLocaleContext } from '../../contexts/Locale.context';

/* * */

export function LocalizedDatesProvider({ children }: PropsWithChildren) {
	//

	//
	// A. Setup variables

	const localeContext = useLocaleContext();

	const settings: Partial<DatesProviderSettings> = {
		firstDayOfWeek: 1,
		locale: localeContext.data.locale,
		weekendDays: [6, 0],
	};

	//
	// B. Render components

	return (
		<DatesProvider settings={settings}>
			{children}
		</DatesProvider>
	);

	//
}
