'use client';

import { ValidationsDetailResultGroup } from '@/components/validations/detail/ValidationsDetailResultGroup';
import { useValidationsDetailResultsContext } from '@/components/validations/detail/ValidationsDetailResults.context';
import { NoDataLabel } from '@tmlmobilidade/ui';
import { useTranslation } from 'react-i18next';

/* * */

export function ValidationsDetailResultsList() {
	//

	//
	// A. Setup variables

	const { t } = useTranslation();
	const { data: { results } } = useValidationsDetailResultsContext();

	//
	// B. Render components

	if (results.length === 0) return <NoDataLabel text={t('validations:detail.ValidationsDetailResultsList.empty')} />;

	return (
		<div>
			{results.map(({ id, result }) => <ValidationsDetailResultGroup key={id} result={result} />)}
		</div>
	);

	//
}
