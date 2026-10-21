/* * */

import { PeriodsListContextProvider } from '@/components/year-periods/list/PeriodsList.context';
import { LinesContextProvider } from '@/contexts/Lines.context';
import { MeContextProvider } from '@tmlmobilidade/ui';
import { type PropsWithChildren } from 'react';

/* * */

export function EventPeriodsProviders({ children }: PropsWithChildren) {
	return (
		<MeContextProvider>
			<LinesContextProvider>
				<PeriodsListContextProvider>{children}</PeriodsListContextProvider>
			</LinesContextProvider>
		</MeContextProvider>
	);
}
