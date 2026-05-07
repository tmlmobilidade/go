'use client';

/* * */

import { AlertsCarousel } from '@/components/common/AlertsCarousel';
import { Section } from '@/components/layout/Section';
import { Surface } from '@/components/layout/Surface';
import { useStopsDetailContext } from '@/contexts/StopsDetail.context';
import { useTranslations } from 'next-intl';

/* * */

export function StopsDetailAlerts() {
	//

	//
	// A. Setup variables

	const t = useTranslations('stops.StopsDetailAlerts');
	const stopsDetailContext = useStopsDetailContext();

	//
	// B. Render components

	if (!stopsDetailContext.data.stop || !stopsDetailContext.data.active_alerts || stopsDetailContext.data.active_alerts?.length === 0) {
		return null;
	}

	return (
		<Surface variant="alerts">
			<Section heading={t('heading')} subheading={t('subheading')} withGap>
				<AlertsCarousel alerts={stopsDetailContext.data.active_alerts} />
			</Section>
		</Surface>
	);

	//
}
