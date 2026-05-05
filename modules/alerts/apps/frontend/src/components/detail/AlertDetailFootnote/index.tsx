/* * */

import { useAlertDetailContext } from '@/components/detail/AlertDetail.context';
import { Dates } from '@tmlmobilidade/dates';
import { Label, Section, UserTag } from '@tmlmobilidade/ui';
import { useMemo } from 'react';

/* * */

export function AlertDetailFootnote() {
	//

	//
	// A. Setup variables

	const alertDetailContext = useAlertDetailContext();

	//
	// B. Transform data

	const formattedDateString = useMemo(() => {
		// Skip if no value
		if (!alertDetailContext.data.alert.created_at) return 'N/A';
		// Convert the Unix timestamp to a Date object.
		return Dates
			.fromUnixTimestamp(alertDetailContext.data.alert.created_at)
			.toLocaleString({ day: '2-digit', hour: '2-digit', minute: '2-digit', month: 'long', year: 'numeric' }, 'pt-PT');
	}, [alertDetailContext.data.alert.created_at]);

	//
	// C. Render components

	return (
		<Section>
			<Label size="sm">Alerto criado por <UserTag userId={alertDetailContext.data.alert.created_by} variant="inline" /> a {formattedDateString}</Label>
		</Section>
	);

	//
}
