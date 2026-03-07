/* * */

import { EventsList } from '@/components/events/list/EventsList';
import { EventsListContextProvider } from '@/components/events/list/EventsList.context';
import { PanesManager } from '@tmlmobilidade/ui';
import { type PropsWithChildren } from 'react';

/* * */

export default function Layout({ children }: PropsWithChildren) {
	return (
		<PanesManager
			id="events"
			panes={[
				<EventsListContextProvider>
					<EventsList />
				</EventsListContextProvider>,
				children,
			]}
		/>
	);
}
