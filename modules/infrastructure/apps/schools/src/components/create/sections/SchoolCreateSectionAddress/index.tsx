'use client';

import { Collapsible, Grid, Section } from '@tmlmobilidade/ui';
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
		<Collapsible
			description={t('schools:create.SchoolCreateSectionAddress.description')}
			title={t('schools:create.SchoolCreateSectionAddress.title')}
		>
			<Section gap="sm">
				<Grid columns="ab" gap="md">
					{schoolAddressFields.map(name => (
						<SchoolCreateTextField key={name} form={form} label={t(`schools:create.SchoolCreateSectionAddress.fields.${name}`)} name={name} />
					))}
				</Grid>
			</Section>
		</Collapsible>
	);
}
