/* * */

import { useValidationsDetailContext } from '@/contexts/ValidationsDetail.context';
import { Dates } from '@tmlmobilidade/dates';
import { Label, Section, UserTag } from '@tmlmobilidade/ui';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

/* * */

export function ValidationsDetailFootnote() {
	//

	//
	// A. Setup variables

	const validationsDetailContext = useValidationsDetailContext();
	const { t } = useTranslation();

	//
	// B. Transform data

	const formattedDateString = useMemo(() => {
		// Skip if no value
		if (!validationsDetailContext.data.validation.created_at) return 'N/A';
		// Convert the Unix timestamp to a Date object.
		return Dates
			.fromUnixTimestamp(validationsDetailContext.data.validation.created_at)
			.toLocaleString({ day: '2-digit', hour: '2-digit', minute: '2-digit', month: 'long', year: 'numeric' }, 'pt-PT');
	}, [validationsDetailContext.data.validation.created_at]);

	//
	// C. Render components

	return (
		<Section>
			<Label size="sm">Validação criada por <UserTag userId={validationsDetailContext.data.validation.created_by} variant="inline" /> a {formattedDateString}</Label>
			<Label size="sm">{t('plans:validations.detail.ValidationsDetailFootnote.created_by_label', { createdBy: validationsDetailContext.data.file.created_by, formattedDateString: formattedDateString })}</Label>
			<Label size="sm">{t('plans:validations.detail.ValidationsDetailFootnote.label')}</Label>
		</Section>
	);

	//
}
