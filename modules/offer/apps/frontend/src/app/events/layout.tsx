/* * */

import { EventsList } from '@/components/events/list/EventsList';
import { PanesManager } from '@tmlmobilidade/ui';
import { Fragment, type PropsWithChildren } from 'react';

/* * */

export default function Layout({ children }: PropsWithChildren) {
	return (
		<PanesManager
			id="events"
			panes={[
				<EventsList key="list" />,
				<Fragment key="children">{children}</Fragment>,
			]}
		/>
	);
}
