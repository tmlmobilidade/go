'use client';

/* * */

import { AlertsCarousel } from '@/components/lines/common/AlertsCarousel';
import { useStopsDetailContext } from '@/components/stops/detail/StopsDetail.context';
import { Section, Surface } from '@tmlmobilidade/ui';


/* * */

export function StopsDetailAlerts() {
	//

	//
	// A. Setup variables

	const { t } = useTranslation();
	const stopsDetailContext = useStopsDetailContext();

	//
	// B. Render components

	if (!stopsDetailContext.data.stop || !stopsDetailContext.data.active_alerts || stopsDetailContext.data.active_alerts?.length === 0) {
		return null;
	}

	return (
		<Surface variant="bordered">
			<Section padding="md">
				<h2>{t('default:stops.StopsDetailAlerts.heading')}</h2>
				<p>{t('default:stops.StopsDetailAlerts.subheading')}</p>
				<AlertsCarousel alerts={stopsDetailContext.data.active_alerts} />
			</Section>
		</Surface>
	);

	//
}
