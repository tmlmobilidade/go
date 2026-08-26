'use client';

import { Collapsible, Grid, Section, StandardFormController, TextInput } from '@tmlmobilidade/ui';
import { useTranslation } from 'react-i18next';

import { useSchoolsCreateFormContext } from '../../shared/SchoolsCreateForm.context';

/* * */

/* * */

export function SchoolCreateSectionAdministrative() {
	//

	//
	// A. Setup variables

	const { t } = useTranslation();
	const { form: schoolsCreateForm } = useSchoolsCreateFormContext();

	//
	// B. Render components

	return (
		<Collapsible
			description={t('schools:create.SchoolCreateSectionAdministrative.description')}
			title={t('schools:create.SchoolCreateSectionAdministrative.title')}
		>
			<Section gap="sm">
				<Grid columns="ab" gap="md">
					{(['district_id', 'district_name', 'municipality_id', 'municipality_name', 'region_id', 'region_name'] as const).map(name => (
						<StandardFormController
							key={name}
							control={schoolsCreateForm.control}
							name={name}
							render={({ field, fieldState }) => (
								<TextInput
									error={fieldState.error?.message}
									label={t(`schools:create.SchoolCreateSectionAdministrative.fields.${name}`)}
									onBlur={field.onBlur}
									onChange={e => field.onChange(e.currentTarget.value)}
									value={field.value ?? ''}
									w="100%"
								/>
							)}
						/>
					))}
				</Grid>
			</Section>
		</Collapsible>
	);
}
