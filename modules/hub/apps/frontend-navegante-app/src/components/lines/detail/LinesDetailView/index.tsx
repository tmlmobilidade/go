'use client';

import { useLinesDetailContext } from '@/components/lines/detail/LinesDetail.context';
import { LinesDetailAlerts } from '@/components/lines/detail/LinesDetailAlerts';
import { LinesDetailHeader } from '@/components/lines/detail/LinesDetailHeader';
import { LinesDetailPath } from '@/components/lines/detail/LinesDetailPath';
import { LinesDetailToolbar } from '@/components/lines/detail/LinesDetailToolbar';
import { LinesDetailViewMap } from '@/components/lines/detail/LinesDetailViewMap';
import { LoadingSection, Section } from '@tmlmobilidade/ui';

/* * */

export function LinesDetailView() {
	//

	//
	// A. Setup variables

	const linesDetailContext = useLinesDetailContext();

	//
	// B. Render componentss

	if (linesDetailContext.flags.is_loading) {
		return <LoadingSection fullHeight />;
	}

	return (
		<Section padding="none">
			<LinesDetailViewMap />
			<LinesDetailHeader />
			<LinesDetailToolbar />
			<LinesDetailAlerts />
			<LinesDetailPath />
		</Section>
	);
}
