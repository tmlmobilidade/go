'use client';

import { EventsCreateBasicInfo } from '@/components/events/create/EventsCreateBasicInfo';
import { EventsCreateHeader } from '@/components/events/create/EventsCreateHeader';
import { Pane } from '@tmlmobilidade/ui';

/* * */

export function EventsCreate() {
	return (
		<Pane header={[<EventsCreateHeader key="header" />]}>
			<EventsCreateBasicInfo />
		</Pane>
	);
}
