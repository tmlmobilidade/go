/* * */

import { EventsList } from '@/components/events/list/EventsList';
import { EventsListContextProvider } from '@/components/events/list/EventsList.context';
import { PeriodsListContextProvider } from '@/components/year-periods/list/PeriodsList.context';
import { PanesManager } from '@tmlmobilidade/ui';
import { type PropsWithChildren } from 'react';

/* * */

export default function Layout({ children }: PropsWithChildren) {
	return (
		<PeriodsListContextProvider>
			<PanesManager
				id="events"
				panes={[
					<EventsListContextProvider key="list">
						<EventsList />
					</EventsListContextProvider>,
					children,
				]}
			/>
		</PeriodsListContextProvider>
	);
}
