'use client';

import { Collapsible, Grid, Section } from '@tmlmobilidade/ui';
import { useTranslation } from 'react-i18next';

import { type UseSchoolCreateFormReturnType } from '../../use-schools-create-form';
import { SchoolCreateTextField, type SchoolCreateTextFieldName } from '../SchoolCreateTextField';

/* * */

const schoolOrganizationFields = ['agency_id', 'email'] as const satisfies readonly SchoolCreateTextFieldName[];

interface SchoolCreateSectionOrganizationProps {
	form: UseSchoolCreateFormReturnType['form']
}

/* * */

export function SchoolCreateSectionOrganization({ form }: SchoolCreateSectionOrganizationProps) {
	//

	//
	// A. Setup variables

	const { t } = useTranslation();

	//
	// B. Render components

	return (
		<Collapsible
			description={t('schools:create.SchoolCreateSectionOrganization.description')}
			title={t('schools:create.SchoolCreateSectionOrganization.title')}
		>
			<Section gap="sm">
				<Grid columns="ab" gap="md">
					{schoolOrganizationFields.map(name => (
						<SchoolCreateTextField key={name} form={form} label={t(`schools:create.SchoolCreateSectionOrganization.fields.${name}`)} name={name} />
					))}
				</Grid>
			</Section>
		</Collapsible>
	);
}
