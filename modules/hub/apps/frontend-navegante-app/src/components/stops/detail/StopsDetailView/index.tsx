'use client';

import { useStopsDetailContext } from '@/components/stops/detail/StopsDetail.context';
import { StopsDetailAlerts } from '@/components/stops/detail/StopsDetailAlerts';
import { StopsDetailContent } from '@/components/stops/detail/StopsDetailContent';
import { StopsDetailViewHeader } from '@/components/stops/detail/StopsDetailViewHeader';
import { StopsDetailViewName } from '@/components/stops/detail/StopsDetailViewName';
import { Space } from '@mantine/core';
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
		return (
			<>
				<Space h="90px" />
				<LoadingSection />
			</>
		);
	}

	return (
		<Section padding="none">
			<StopsDetailViewName />
			<StopsDetailViewHeader />
			<Divider />
			<StopsDetailAlerts />
			<StopsDetailContent />
		</Section>
	);
}
