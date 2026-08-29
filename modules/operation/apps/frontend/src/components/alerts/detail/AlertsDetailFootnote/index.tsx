/* * */

import { Dates } from '@tmlmobilidade/go-utils-dates';
import { Label, Section, UserTag } from '@tmlmobilidade/ui';
import { useMemo } from 'react';

import { useAlertsDetailData } from '../use-alerts-detail-data';

/* * */

export function AlertsDetailFootnote() {
	//

	//
	// A. Setup variables

	const { data: alertData } = useAlertsDetailData();

	//
	// B. Transform data

	const formattedDateString = useMemo(() => {
		// Skip if no value
		if (!alertData?.created_at) return 'N/A';
		// Convert the Unix timestamp to a Date object.
		return Dates
			.fromUnixMilliseconds(alertData?.created_at)
			.toLocaleString('full', 'pt-PT');
	}, [alertData?.created_at]);

	//
	// C. Render components

	return (
		<Section>
			<Label size="sm">Alerta criado por <UserTag userId={alertData?.created_by} variant="inline" /> a {formattedDateString}</Label>
		</Section>
	);
}
