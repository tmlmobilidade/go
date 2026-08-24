'use client';

import { Grid, Label, Section } from '@tmlmobilidade/ui';
import { useTranslation } from 'react-i18next';

import { type UseSchoolCreateFormReturnType } from '../../use-schools-create-form';
import { SchoolCreateTextField, type SchoolCreateTextFieldName } from '../SchoolCreateTextField';

/* * */

const schoolAdministrativeFields = [
	'municipality_id',
	'municipality_name',
	'district_id',
	'district_name',
	'region_id',
	'region_name',
] as const satisfies readonly SchoolCreateTextFieldName[];

interface SchoolCreateSectionAdministrativeProps {
	form: UseSchoolCreateFormReturnType['form']
}

/* * */

export function SchoolCreateSectionAdministrative({ form }: SchoolCreateSectionAdministrativeProps) {
	//

	//
	// A. Setup variables

	const { t } = useTranslation();

	//
	// B. Render components

	return (
		<Section gap="sm">
			<Label size="lg" caps>{t('schools:create.SchoolCreateSectionAdministrative.title')}</Label>
			<Grid columns="ab" gap="md">
				{schoolAdministrativeFields.map(name => (
					<SchoolCreateTextField key={name} form={form} label={t(`schools:create.SchoolCreateSectionAdministrative.fields.${name}`)} name={name} />
				))}
			</Grid>
		</Section>
	);
}
