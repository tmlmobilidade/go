'use client';

import { AlertsCarousel } from '@/components/lines/common/AlertsCarousel';
import { useLinesDetailContext } from '@/components/lines/detail/LinesDetail.context';
import { Section, Surface } from '@tmlmobilidade/ui';
/* * */

export function LinesDetailAlerts() {
	//

	//
	// A. Setup variables

	const linesDetailContext = useLinesDetailContext();

	//
	// B. Render components

	if (!linesDetailContext.data.line || !linesDetailContext.data.active_alerts || linesDetailContext.data.active_alerts?.length === 0) {
		return null;
	}

	return (
		<Surface>
			<Section>
				<AlertsCarousel alerts={linesDetailContext.data.active_alerts} />
			</Section>
		</Surface>
	);

	//
}
