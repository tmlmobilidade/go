'use client';

import { useLinesDetailContext } from '@/components/lines/detail/LinesDetail.context';
import { LinesDetailAlerts } from '@/components/lines/detail/LinesDetailAlerts';
import { LinesDetailHeader } from '@/components/lines/detail/LinesDetailHeader';
import { LinesDetailNavigation } from '@/components/lines/detail/LinesDetailNavigation';
import { LinesDetailPath } from '@/components/lines/detail/LinesDetailPath';
import { LinesDetailToolbar } from '@/components/lines/detail/LinesDetailToolbar';
import { LoadingSection, Section, Surface } from '@tmlmobilidade/ui';

import { LinesDetailPathMap } from '../LinesDetailPathMap';

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

			<LinesDetailPathMap />

			<Surface>
				<LinesDetailNavigation />
				<LinesDetailHeader />
				<LinesDetailToolbar />
			</Surface>

			<LinesDetailAlerts />
			<LinesDetailPath />

		</Section>
	);
}
