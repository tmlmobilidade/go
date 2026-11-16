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

	if (lineDetailContext.status.isLoading) {
		return <LoadingOverlay />;
	}

	if (lineDetailContext.error) {
		return <ErrorDisplay message={lineDetailContext.error} />;
	}

	return (
		<Pane header={[<RouteDetailHeader key="header" />]}>
			<RouteDetailSectionConfig />
			<RouteDetailSectionPatterns />
		</Pane>
	);

	//
}
