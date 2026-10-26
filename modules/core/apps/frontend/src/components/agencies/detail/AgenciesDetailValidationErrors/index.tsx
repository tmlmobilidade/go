'use client';

import { UpdateAgencySchema } from '@tmlmobilidade/go-types-core';
import { Alert, useStandardFormWatch } from '@tmlmobilidade/ui';
import { useTranslation } from 'react-i18next';

import { useAgenciesDetailFormContext } from '../AgenciesDetailForm.context';

/* * */

export function AgenciesDetailValidationErrors() {
	//

	//
	// A. Setup variables

	const { t } = useTranslation();
	const { form } = useAgenciesDetailFormContext();
	const values = useStandardFormWatch({ control: form.control });

	//
	// B. Render components

	if (Object.keys(form.formState.errors).length === 0) return null;
	const result = UpdateAgencySchema.safeParse(values);
	if (result.success) return null;

	return (
		<Alert color="red" title={t('default:agencies.detail.validationError')}>
			<ul>
				{result.error.issues.map((issue, index) => <li key={`${issue.path.join('.')}-${index}`}>{issue.path.join('.')}: {issue.message}</li>)}
			</ul>
		</Alert>
	);
}
