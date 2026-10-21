/* * */

import { EventsList } from '@/components/events/list/EventsList';
import { PeriodsListContextProvider } from '@/components/year-periods/list/PeriodsList.context';
import { PanesManager } from '@tmlmobilidade/ui';
import { Fragment, type PropsWithChildren } from 'react';

/* * */

export default function Layout({ children }: PropsWithChildren) {
	return (
		<PeriodsListContextProvider>
			<PanesManager
				id="events"
				panes={[
					<EventsList key="list" />,
					<Fragment key="children">{children}</Fragment>,
				]}
			/>
		</PeriodsListContextProvider>
	);
}
