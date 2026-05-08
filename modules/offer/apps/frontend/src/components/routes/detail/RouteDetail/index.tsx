'use client';

import { useRouteDetailContext } from '@/components/routes/detail/RouteDetail.context';
import { RouteDetailHeader } from '@/components/routes/detail/RouteDetailHeader';
import { RouteDetailSectionConfig } from '@/components/routes/detail/RouteDetailSectionConfig';
import { RouteDetailSectionPatterns } from '@/components/routes/detail/RouteDetailSectionPatterns';
import { ErrorDisplay, LoadingOverlay, Pane } from '@tmlmobilidade/ui';

/* * */

export function RouteDetail() {
	//

	//
	// A. Setup variables

	const lineDetailContext = useRouteDetailContext();

	//
	// B. Render components

	if (lineDetailContext.flags.isLoading) {
		return <LoadingOverlay />;
	}

	if (lineDetailContext.flags.error) {
		return <ErrorDisplay message={lineDetailContext.flags.error.message} />;
	}

	return (
		<Pane header={[<RouteDetailHeader />]}>
			<RouteDetailSectionConfig />
			<RouteDetailSectionPatterns />
		</Pane>
	);

	//
}
