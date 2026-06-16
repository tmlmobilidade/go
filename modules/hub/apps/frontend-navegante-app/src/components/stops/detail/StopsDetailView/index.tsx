'use client';

import { FeedbackForm } from '@/components/feedback';
import { useStopsDetailContext } from '@/components/stops/detail/StopsDetail.context';
import { StopsDetailAlerts } from '@/components/stops/detail/StopsDetailAlerts';
import { StopsDetailViewHeader } from '@/components/stops/detail/StopsDetailViewHeader';
import { StopsDetailViewTimetable } from '@/components/stops/detail/StopsDetailViewTimetable';
import { Divider, LoadingSection, Section } from '@tmlmobilidade/ui';

/* * */

export function StopsDetailView() {
	//

	//
	// A. Setup variables

	const stopsDetailContext = useStopsDetailContext();

	//
	// B. Render componentss

	if (stopsDetailContext.flags.is_loading) {
		return <LoadingSection fullHeight />;
	}

	return (
		<Section padding="none">
			<StopsDetailViewHeader />
			<FeedbackForm entityType="stop" />
			<Divider />
			<StopsDetailAlerts />
			<StopsDetailViewTimetable />
		</Section>
	);
}
