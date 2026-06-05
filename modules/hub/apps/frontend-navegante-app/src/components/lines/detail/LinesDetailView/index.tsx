'use client';

import { useLinesDetailContext } from '@/components/lines/detail/LinesDetail.context';
import { LinesDetailAlerts } from '@/components/lines/detail/LinesDetailAlerts';
import { LinesDetailPath } from '@/components/lines/detail/LinesDetailPath';
import { LinesDetailToolbar } from '@/components/lines/detail/LinesDetailToolbar';
import { LinesDetailViewHeader } from '@/components/lines/detail/LinesDetailViewHeader';
import { LinesDetailViewMap } from '@/components/lines/detail/LinesDetailViewMap';
import { Space } from '@mantine/core';
import { Divider, LoadingSection, Section } from '@tmlmobilidade/ui';

/* * */

export function LinesDetailView() {
	//

	//
	// A. Setup variables

	const linesDetailContext = useLinesDetailContext();

	//
	// B. Render componentss

	if (linesDetailContext.flags.is_loading) {
		return (
			<>
				<Space h="90px" />
				<LoadingSection />
			</>
		);
	}

	return (
		<Section padding="none">
			<LinesDetailViewMap />
			<LinesDetailViewHeader />
			<Divider />
			<LinesDetailToolbar />
			<LinesDetailAlerts />
			<LinesDetailPath />
		</Section>
	);
}
