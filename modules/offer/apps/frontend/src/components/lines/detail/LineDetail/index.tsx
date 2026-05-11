'use client';

import { useLineDetailContext } from '@/components/lines/detail/LineDetail.context';
import { LineDetailHeader } from '@/components/lines/detail/LineDetailHeader';
import { LineDetailSectionConfig } from '@/components/lines/detail/LineDetailSectionConfig';
import { LineDetailSectionRoutes } from '@/components/lines/detail/LineDetailSectionRoutes';
import { LineDetailSectionSpecs } from '@/components/lines/detail/LineDetailSectionSpecs';
import { LineDetailSectionTypology } from '@/components/lines/detail/LineDetailSectionTypology';
import { ErrorDisplay, LoadingOverlay, Pane } from '@tmlmobilidade/ui';

/* * */

export function LineDetail() {
	//

	//
	// A. Setup variables

	const lineDetailContext = useLineDetailContext();

	//
	// B. Render components

	if (lineDetailContext.flags.isLoading) {
		return <LoadingOverlay />;
	}

	if (lineDetailContext.flags.error) {
		return <ErrorDisplay message={lineDetailContext.flags.error.message} />;
	}

	return (
		<Pane header={[<LineDetailHeader />]}>
			<LineDetailSectionConfig />
			<LineDetailSectionTypology />
			<LineDetailSectionSpecs />
			<LineDetailSectionRoutes />
		</Pane>
	);

	//
}
