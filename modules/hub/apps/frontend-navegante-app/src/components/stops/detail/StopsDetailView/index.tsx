'use client';

import { DetailUnavailable } from '@/components/common/display/DetailUnavailable';
import { FeedbackForm } from '@/components/feedback/FeedbackForm';
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
	// B. Render components

	if (stopsDetailContext.flags.is_loading) {
		return <LoadingSection fullHeight />;
	}

	if (stopsDetailContext.flags.has_error || stopsDetailContext.flags.is_not_found) {
		return <DetailUnavailable reason={stopsDetailContext.flags.has_error ? 'error' : 'not-found'} />;
	}

	return (
		<Section padding="none">
			<StopsDetailViewHeader />
			<FeedbackForm
				entityId={stopsDetailContext.data.stop?._id != null ? String(stopsDetailContext.data.stop._id) : undefined}
				entityType="stop"
			/>
			<Divider />
			<StopsDetailAlerts />
			<StopsDetailViewTimetable />
		</Section>
	);
}
