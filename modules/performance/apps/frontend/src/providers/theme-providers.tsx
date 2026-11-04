'use client';

import { fetchPerformanceData } from '@/utils/fetch-performance-data';
import { DatesProvider, type DatesProviderProps } from '@mantine/dates';
import 'dayjs/locale/pt';
import { SWRConfig } from 'swr';

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
	const swrSettings = {
		fetcher: fetchPerformanceData,
	};

	//
	// B. Render components

	return (
		<SWRConfig value={swrSettings}>
			<DatesProvider settings={mantineDatesSettings}>
				{children}
			</DatesProvider>
		</SWRConfig>
	);

	//
}
