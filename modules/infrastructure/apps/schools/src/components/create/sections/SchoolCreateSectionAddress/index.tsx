'use client';

import { Grid, Label, Section } from '@tmlmobilidade/ui';
import { useTranslation } from 'react-i18next';

import { type UseSchoolCreateFormReturnType } from '../../use-schools-create-form';
import { SchoolCreateTextField, type SchoolCreateTextFieldName } from '../SchoolCreateTextField';

/* * */

const schoolAddressFields = ['address', 'locality', 'parish_name', 'postal_code'] as const satisfies readonly SchoolCreateTextFieldName[];

interface SchoolCreateSectionAddressProps {
	form: UseSchoolCreateFormReturnType['form']
}

/* * */

export function SchoolCreateSectionAddress({ form }: SchoolCreateSectionAddressProps) {
	//

	//
	// A. Setup variables

	const { t } = useTranslation();

	//
	// B. Render components

	return (
		<Section gap="sm">
			<Label size="lg" caps>{t('schools:create.SchoolCreateSectionAddress.title')}</Label>
			<Grid columns="ab" gap="md">
				{schoolAddressFields.map(name => (
					<SchoolCreateTextField key={name} form={form} label={t(`schools:create.SchoolCreateSectionAddress.fields.${name}`)} name={name} />
				))}
			</Grid>
		</Section>
	);
}
