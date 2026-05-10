'use client';

import { EventCreateBasicInfo } from '@/components/events/create/EventCreateBasicInfo';
import { EventCreateHeader } from '@/components/events/create/EventCreateHeader';
import { Pane } from '@tmlmobilidade/ui';

/* * */

export function EventCreate() {
	return (
		<Pane header={[<EventCreateHeader />]}>
			<EventCreateBasicInfo />
		</Pane>
	);
}
