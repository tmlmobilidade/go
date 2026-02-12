/* * */

import { PeriodsListContextProvider } from '@/components/periods/list/PeriodsList.context';
import { AgenciesContextProvider } from '@/contexts/Agencies.context';
import { LinesContextProvider } from '@/contexts/Lines.context';
import { type PropsWithChildren } from 'react';

/* * */

export function DataProviders({ children }: PropsWithChildren) {
	return (
		<AgenciesContextProvider>
			<LinesContextProvider>
				<PeriodsListContextProvider>
					{children}
				</PeriodsListContextProvider>
			</LinesContextProvider>
		</AgenciesContextProvider>
	);
}
