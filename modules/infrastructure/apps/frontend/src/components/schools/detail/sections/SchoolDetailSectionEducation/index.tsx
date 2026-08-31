'use client';

import { useSchoolsDetailFormContext } from '@/components/schools/detail/SchoolsDetailForm.context';
import { Collapsible, Grid, Section, StandardFormController, Switch } from '@tmlmobilidade/ui';
import { useTranslation } from 'react-i18next';

/* * */

const educationFields = [
	'pre_school',
	'basic_1',
	'basic_2',
	'basic_3',
	'high_school',
	'professional',
	'special',
	'artistic',
	'university',
	'other',
] as const;

/* * */

export function SchoolDetailSectionEducation() {
	//

	//
	// A. Setup variables

	const { t } = useTranslation();

	const { capabilities, form } = useSchoolsDetailFormContext();

	//
	// B. Render components

	return (
		<Collapsible
			description={t('schools:create.SchoolCreateSectionEducation.description')}
			title={t('schools:create.SchoolCreateSectionEducation.title')}
		>
			<Section padding="lg">
				<Grid columns="abc" gap="md">
					{educationFields.map(name => (
						<StandardFormController
							key={name}
							control={form.control}
							name={name}
							render={({ field, fieldState }) => (
								<Switch
									checked={field.value ?? false}
									disabled={!capabilities?.editEnabled}
									error={fieldState.error?.message}
									label={t(`schools:create.SchoolCreateSectionEducation.fields.${name}`)}
									onChange={e => field.onChange(e.currentTarget.checked)}
								/>
							)}
						/>
					))}
				</Grid>
			</Section>
		</Collapsible>
	);
}
