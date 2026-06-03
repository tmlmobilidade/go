'use client';

import { StopsDetailNavigation } from '@/components/stops/detail/StopDetailNavigation';
import { useStopsDetailContext } from '@/components/stops/detail/StopsDetail.context';
import { StopsDetailAlerts } from '@/components/stops/detail/StopsDetailAlerts';
import { StopsDetailContent } from '@/components/stops/detail/StopsDetailContent';
import { StopsDetailHeader } from '@/components/stops/detail/StopsDetailHeader';
import { LoadingSection, Surface } from '@tmlmobilidade/ui';

/* * */

export function StopsDetail() {
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
		<>
			<Surface>
				<StopsDetailNavigation />
				<StopsDetailHeader />
			</Surface>
			<StopsDetailAlerts />
			<StopsDetailContent />
		</>
	);
}
