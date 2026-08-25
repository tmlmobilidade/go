/* * */

import { useValidationsDetailContext } from '@/components/validations/detail/ValidationsDetailForm.context';
import { Dates } from '@tmlmobilidade/go-utils-dates';
import { Label, Section, UserTag } from '@tmlmobilidade/ui';
import { useMemo } from 'react';

/* * */

export function ValidationsDetailFootnote() {
	//

	//
	// A. Setup variables

	const validationsDetailContext = useValidationsDetailContext();

	//
	// B. Transform data

	const formattedDateString = useMemo(() => {
		// Skip if no value
		if (!validationsDetailContext.data.validation.created_at) return 'N/A';
		// Convert the Unix timestamp to a Date object.
		return Dates
			.fromUnixTimestamp(validationsDetailContext.data.validation.created_at)
			.toFormat('dd \'de\' LLLL \'de\' yyyy \'às\' HH:mm', { locale: 'pt-PT' });
	}, [validationsDetailContext.data.validation.created_at]);

	//
	// C. Render components

	return (
		<Section>
			<Label size="sm">Validação criada por <UserTag userId={validationsDetailContext.data.validation.created_by} variant="inline" /> a {formattedDateString}</Label>
			<Label size="sm">As validações são eliminadas automaticamente ao fim de 30 dias após a sua data de criação. Poderão ser eliminadas mais cedo se necessário.</Label>
		</Section>
	);

	//
}
