/* * */

import { PeriodsListContextProvider } from '@/components/year-periods/list/PeriodsList.context';
import { AgenciesContextProvider } from '@/contexts/Agencies.context';
import { LinesContextProvider } from '@/contexts/Lines.context';
import { MeContextProvider } from '@tmlmobilidade/ui';
import { type PropsWithChildren } from 'react';

/* * */

export function DataProviders({ children }: PropsWithChildren) {
	return (
		<MeContextProvider>
			<AgenciesContextProvider>
				<LinesContextProvider>
					<PeriodsListContextProvider>
						{children}
					</PeriodsListContextProvider>
				</LinesContextProvider>
			</AgenciesContextProvider>
		</MeContextProvider>
	);
}
