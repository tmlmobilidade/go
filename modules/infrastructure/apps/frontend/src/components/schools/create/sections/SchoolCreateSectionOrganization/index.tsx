'use client';

import { Collapsible, Grid, Section, StandardFormController, TextInput } from '@tmlmobilidade/ui';
import { useTranslation } from 'react-i18next';

import { useSchoolsCreateFormContext } from '../../shared/SchoolsCreateForm.context';

/* * */

export function SchoolCreateSectionOrganization() {
	//

	//
	// A. Setup variables

	const { t } = useTranslation();

	const { form: schoolsCreateForm } = useSchoolsCreateFormContext();

	//
	// B. Render components

	return (
		<Collapsible
			description={t('schools:create.SchoolCreateSectionOrganization.description')}
			title={t('schools:create.SchoolCreateSectionOrganization.title')}
		>
			<Section padding="lg">
				<Grid columns="abc" gap="md">

					<StandardFormController
						control={schoolsCreateForm.control}
						name="email"
						render={({ field, fieldState }) => (
							<TextInput
								error={fieldState.error?.message}
								label={t('schools:create.SchoolCreateSectionOrganization.fields.email')}
								onBlur={field.onBlur}
								onChange={e => field.onChange(e.currentTarget.value)}
								value={field.value ?? ''}
								w="100%"
							/>
						)}
					/>

					<StandardFormController
						control={schoolsCreateForm.control}
						name="url"
						render={({ field, fieldState }) => (
							<TextInput
								error={fieldState.error?.message}
								label={t('schools:create.SchoolCreateSectionOrganization.fields.url')}
								onBlur={field.onBlur}
								onChange={e => field.onChange(e.currentTarget.value)}
								value={field.value ?? ''}
								w="100%"
							/>
						)}
					/>
				</Grid>
			</Section>
		</Collapsible>
	);
}
