'use client';

import { useStopsDetailContext } from '@/components/stops/detail/StopsDetail.context';
import { StopsDetailAlerts } from '@/components/stops/detail/StopsDetailAlerts';
import { StopsDetailViewHeader } from '@/components/stops/detail/StopsDetailViewHeader';
import { StopsDetailViewMap } from '@/components/stops/detail/StopsDetailViewMap';
import { Space } from '@mantine/core';
import { Divider, LoadingSection, Section } from '@tmlmobilidade/ui';

import { StopsDetailContent } from '../StopsDetailContent';

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
			<StopsDetailViewMap />
			<StopsDetailViewHeader />
			<Divider />
			<StopsDetailAlerts />
			<StopsDetailContent />
		</Section>
	);
}
