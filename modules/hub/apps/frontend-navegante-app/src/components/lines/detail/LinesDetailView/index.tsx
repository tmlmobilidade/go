'use client';

import { DetailUnavailable } from '@/components/common/display/DetailUnavailable';
import { FeedbackForm } from '@/components/feedback/FeedbackForm';
import { useLinesDetailContext } from '@/components/lines/detail/LinesDetail.context';
import { LinesDetailAlerts } from '@/components/lines/detail/LinesDetailAlerts';
import { LinesDetailPath } from '@/components/lines/detail/LinesDetailPath';
import { LinesDetailToolbar } from '@/components/lines/detail/LinesDetailToolbar';
import { LinesDetailViewHeader } from '@/components/lines/detail/LinesDetailViewHeader';
import { Divider, LoadingSection, Section, Space } from '@tmlmobilidade/ui';

/* * */

export function LinesDetailView() {
	//

	//
	// A. Setup variables

	const linesDetailContext = useLinesDetailContext();

	//
	// B. Render components

	if (linesDetailContext.flags.is_loading) {
		return (
			<>
				<Space h="90px" />
				<LoadingSection />
			</>
		);
	}

	if (linesDetailContext.flags.has_error || linesDetailContext.flags.is_not_found) {
		return <DetailUnavailable reason={linesDetailContext.flags.has_error ? 'error' : 'not-found'} />;
	}

	return (
		<Section padding="none">
			<LinesDetailViewHeader />
			<FeedbackForm agencyId={linesDetailContext.data.line?.agency_id} entityId={linesDetailContext.data.line?._id} entityType="line" />
			<Divider />
			<LinesDetailToolbar />
			<LinesDetailAlerts />
			<LinesDetailPath />
		</Section>
	);
}
