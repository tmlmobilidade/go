'use client';

/* * */

import { AlertsCarousel } from '@/components/lines/common/AlertsCarousel';
import { useStopsDetailContext } from '@/components/stops/detail/StopsDetail.context';
import { Surface } from '@tmlmobilidade/ui';

/* * */

export function StopsDetailAlerts() {
	//

	//
	// A. Setup variables

	const stopsDetailContext = useStopsDetailContext();

	//
	// B. Render components

	if (!stopsDetailContext.data.stop || !stopsDetailContext.data.active_alerts?.length) {
		return null;
	}

	return (
		<Surface variant="plain">
			<AlertsCarousel alerts={stopsDetailContext.data.active_alerts} />
		</Surface>
	);

	//
}
