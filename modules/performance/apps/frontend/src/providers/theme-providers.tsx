'use client';

import { DatesProvider, type DatesProviderProps } from '@mantine/dates';
import 'dayjs/locale/pt';

/* * */

interface Props {
	children: React.ReactNode
}

/* * */

export function ThemeProviders({ children }: Props) {
	//

	//
	// A. Setup variables

	const mantineDatesSettings: Partial<DatesProviderProps['settings']> = {
		firstDayOfWeek: 1,
		locale: 'pt',
		weekendDays: [6, 0],
	};

	//
	// B. Render components

	return (
		<DatesProvider settings={mantineDatesSettings}>
			{children}
		</DatesProvider>
	);

	//
}
