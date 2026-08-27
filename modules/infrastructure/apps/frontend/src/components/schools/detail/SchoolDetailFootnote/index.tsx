/* * */

import { useSchoolDetailContext } from '@/components/schools/detail/SchoolDetail.context';
import { Dates } from '@tmlmobilidade/go-utils-dates';
import { Label, Section, UserTag } from '@tmlmobilidade/ui';
import { useMemo } from 'react';

/* * */

export function SchoolDetailFootnote() {
	//

	//
	// A. Setup variables

	const schoolDetailContext = useSchoolDetailContext();

	//
	// B. Transform data

	const formattedDateString = useMemo(() => {
		// Skip if no value
		if (!schoolDetailContext.data.school.created_at) return 'N/A';
		// Convert the Unix timestamp to a Date object.
		return Dates
			.fromUnixTimestamp(schoolDetailContext.data.school.created_at)
			.toLocaleString('full', 'pt-PT');
	}, [schoolDetailContext.data.school.created_at]);

	//
	// C. Render components

	return (
		<Section>
			<Label size="sm">Escola criado por <UserTag userId={schoolDetailContext.data.school.created_by} variant="inline" /> a {formattedDateString}</Label>
		</Section>
	);

	//
}
