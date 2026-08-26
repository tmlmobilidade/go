'use client';

import { Collapsible, DateTimeInput, Grid, Section, StandardFormController, Switch, TagsInput } from '@tmlmobilidade/ui';
import { useTranslation } from 'react-i18next';

import { useSchoolsCreateFormContext } from '../../shared/SchoolsCreateForm.context';

/* * */

export function SchoolCreateSectionOperations() {
	//

	//
	// A. Setup variables

	const { t } = useTranslation();
	const { form: schoolsCreateForm } = useSchoolsCreateFormContext();

	//
	// B. Render components

	return (
		<Collapsible
			description={t('schools:create.SchoolCreateSectionOperations.description')}
			title={t('schools:create.SchoolCreateSectionOperations.title')}
		>
			<Section padding="lg">
				<Grid columns="ab" gap="md">
					<StandardFormController
						control={schoolsCreateForm.control}
						name="is_active"
						render={({ field, fieldState }) => (
							<Switch
								checked={field.value ?? false}
								error={fieldState.error?.message}
								label={t('schools:create.SchoolCreateSectionOperations.fields.is_active')}
								onChange={e => field.onChange(e.currentTarget.checked)}
							/>
						)}
					/>

					<StandardFormController
						control={schoolsCreateForm.control}
						name="validation_date"
						render={({ field, fieldState }) => (
							<DateTimeInput
								error={fieldState.error?.message}
								label={t('schools:create.SchoolCreateSectionOperations.fields.validation_date')}
								onChange={field.onChange}
								value={field.value}
								clearable
							/>
						)}
					/>

					<StandardFormController
						control={schoolsCreateForm.control}
						name="stops"
						render={({ field, fieldState }) => (
							<TagsInput
								error={fieldState.error?.message}
								label={t('schools:create.SchoolCreateSectionOperations.fields.stops')}
								onChange={field.onChange}
								value={field.value ?? []}
								w="100%"
							/>
						)}
					/>
				</Grid>
			</Section>
		</Collapsible>
	);
}
