'use client';

import { useStopsDetailContext } from '@/components/stops/detail/StopsDetail.context';
import { StopsDetailAlerts } from '@/components/stops/detail/StopsDetailAlerts';
import { StopsDetailContent } from '@/components/stops/detail/StopsDetailContent';
import { StopsDetailViewHeader } from '@/components/stops/detail/StopsDetailViewHeader';
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
			<Divider />
			<StopsDetailAlerts />
			<StopsDetailContent />
		</Section>
	);
}
