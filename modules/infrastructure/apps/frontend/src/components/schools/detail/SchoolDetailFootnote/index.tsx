/* * */

import { useSchoolsDetailSchoolData } from '@/components/schools/detail/use-schools-detail-school-data';
import { Dates } from '@tmlmobilidade/go-utils-dates';
import { Label, Section, UserTag } from '@tmlmobilidade/ui';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

/* * */

export function SchoolDetailFootnote() {
	//

	//
	// A. Setup variables

	const { data: schoolData } = useSchoolsDetailSchoolData();
	const { i18n, t } = useTranslation();

	//
	// B. Transform data

	const formattedDateString = useMemo(() => {
		if (!schoolData?.created_at) return t('schools:detail.SchoolDetailFootnote.not_available');
		return Dates
			.fromUnixMilliseconds(schoolData.created_at)
			.toLocaleString('full', i18n.language === 'es' ? 'es-ES' : 'pt-PT');
	}, [i18n.language, schoolData?.created_at, t]);

	//
	// C. Render components

	return (
		<Section>
			<Label size="sm">
				{t('schools:detail.SchoolDetailFootnote.created_by')} <UserTag userId={schoolData?.created_by} variant="inline" /> {t('schools:detail.SchoolDetailFootnote.at')} {formattedDateString}
			</Label>
		</Section>
	);
}
