/* * */

import { useSchoolsDetailSchoolData } from '@/components/schools/detail/use-schools-detail-school-data';
import { Dates } from '@tmlmobilidade/go-utils-dates';
import { Label, Section, UserTag } from '@tmlmobilidade/ui';
import { useMemo } from 'react';

/* * */

export function SchoolDetailFootnote() {
	//

	//
	// A. Setup variables

	const { data: schoolData } = useSchoolsDetailSchoolData();

	//
	// B. Transform data

	const formattedDateString = useMemo(() => {
		if (!schoolData?.created_at) return 'N/A';
		return Dates
			.fromUnixTimestamp(schoolData.created_at)
			.toLocaleString('full', 'pt-PT');
	}, [schoolData?.created_at]);

	//
	// C. Render components

	return (
		<Section>
			<Label size="sm">Escola criada por <UserTag userId={schoolData?.created_by} variant="inline" /> a {formattedDateString}</Label>
		</Section>
	);
}
