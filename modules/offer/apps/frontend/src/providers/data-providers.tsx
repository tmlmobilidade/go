/* * */

import { EventsContextProvider } from '@/contexts/Events.context';
import { FaresContextProvider } from '@/contexts/Fares.context';
import { PeriodsContextProvider } from '@/contexts/Periods.context';
import { TypologiesContextProvider } from '@/contexts/Typologies.context';
import { type PropsWithChildren } from 'react';

/* * */

export function DataProviders({ agency_id, children }: PropsWithChildren<{ agency_id?: string }>) {
	return (
		<PeriodsContextProvider agencyId={agency_id}>
			<FaresContextProvider agencyId={agency_id}>
				<TypologiesContextProvider agencyId={agency_id}>
					<EventsContextProvider agencyId={agency_id}>
						{children}
					</EventsContextProvider>
				</TypologiesContextProvider>
			</FaresContextProvider>
		</PeriodsContextProvider>
	);
}
