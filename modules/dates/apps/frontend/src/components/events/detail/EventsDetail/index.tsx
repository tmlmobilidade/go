'use client';

import { EventsDetailBasicInfo } from '@/components/events/detail/EventsDetailBasicInfo';
import { EventsDetailDates } from '@/components/events/detail/EventsDetailDates';
import { EventsDetailHeader } from '@/components/events/detail/EventsDetailHeader';
import { EventsDetailRules } from '@/components/events/detail/EventsDetailRules';
import { Divider, ErrorDisplay, Pane } from '@tmlmobilidade/ui';

import { useEventsDetailData } from '../use-events-detail-data';

/* * */

export function EventsDetail() {
	//

	//
	// A. Setup variables

	const { error, isLoading } = useEventsDetailData();

	//
	// B. Render components

	return (
		<Pane header={[<EventsDetailHeader key="header" />]} isLoading={isLoading}>
			{error && <ErrorDisplay message={error} />}
			<EventsDetailBasicInfo />
			<EventsDetailDates />
			<Divider />
			<EventsDetailRules />
		</Pane>
	);
}
