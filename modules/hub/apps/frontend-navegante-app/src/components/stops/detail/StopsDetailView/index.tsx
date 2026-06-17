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
			<FeedbackForm
				agencyId={stopsDetailContext.data.stop?.agency_ids?.[0]}
				entityId={stopsDetailContext.data.stop?._id != null ? String(stopsDetailContext.data.stop._id) : undefined}
				entityType="stop"
			/>
			<Divider />
			<StopsDetailAlerts />
			<StopsDetailViewTimetable />
		</Section>
	);
}
