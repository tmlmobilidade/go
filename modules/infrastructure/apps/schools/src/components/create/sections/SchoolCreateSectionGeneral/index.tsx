'use client';

import { Grid, Label, Section } from '@tmlmobilidade/ui';
import { useTranslation } from 'react-i18next';

import { type UseSchoolCreateFormReturnType } from '../../use-schools-create-form';
import { SchoolCreateTextField, type SchoolCreateTextFieldName } from '../SchoolCreateTextField';

/* * */

const schoolGeneralFields = ['name', 'nature', 'grouping'] as const satisfies readonly SchoolCreateTextFieldName[];

interface SchoolCreateSectionGeneralProps {
	form: UseSchoolCreateFormReturnType['form']
}

/* * */

export function SchoolCreateSectionGeneral({ form }: SchoolCreateSectionGeneralProps) {
	//

	//
	// A. Setup variables

	const { t } = useTranslation();

	//
	// B. Render components

	return (
		<Section gap="sm">
			<Label size="lg" caps>{t('schools:create.SchoolCreateSectionGeneral.title')}</Label>
			<Grid columns="ab" gap="md">
				{schoolGeneralFields.map(name => (
					<SchoolCreateTextField key={name} form={form} label={t(`schools:create.SchoolCreateSectionGeneral.fields.${name}`)} name={name} />
				))}
			</Grid>
		</Section>
	);
}
