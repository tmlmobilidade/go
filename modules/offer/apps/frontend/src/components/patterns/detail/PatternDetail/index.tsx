'use client';

import { usePatternDetailContext } from '@/components/patterns/detail/PatternDetail.context';
import { PatternDetailHeader } from '@/components/patterns/detail/PatternDetailHeader';
import { PatternDetailSectionConfig } from '@/components/patterns/detail/PatternDetailSectionConfig';
import { PatternDetailSectionRules } from '@/components/patterns/detail/PatternDetailSectionRules';
import { PatternDetailSectionShape } from '@/components/patterns/detail/PatternDetailSectionShape';
import { PatternDetailSectionTravelTimes } from '@/components/patterns/detail/PatternDetailSectionTravelTimes';
import { PatternDetailSectionZones } from '@/components/patterns/detail/PatternDetailSectionZones';
import { ErrorDisplay, LoadingOverlay, Pane } from '@tmlmobilidade/ui';

/* * */

export function PatternDetail() {
	//

	//
	// A. Setup variables

	const lineDetailContext = usePatternDetailContext();

	//
	// B. Render components

	if (lineDetailContext.flags.isLoading) {
		return <LoadingOverlay />;
	}

	if (lineDetailContext.flags.error) {
		return <ErrorDisplay message={lineDetailContext.flags.error.message} />;
	}

	return (
		<Pane header={[<PatternDetailHeader key="pattern-detail-header" />]}>
			<PatternDetailSectionConfig />
			<PatternDetailSectionShape />
			<PatternDetailSectionZones />
			<PatternDetailSectionTravelTimes />
			<PatternDetailSectionRules />
		</Pane>
	);

	//
}
