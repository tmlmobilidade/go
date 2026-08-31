'use client';

import { useSchoolsDetailFormContext } from '@/components/schools/detail/SchoolsDetailForm.context';
import { Collapsible, Grid, Section, StandardFormController, TextInput } from '@tmlmobilidade/ui';
import { useTranslation } from 'react-i18next';

/* * */

export function SchoolDetailSectionOrganization() {
	//

	//
	// A. Setup variables

	const { t } = useTranslation();

	const { capabilities, form } = useSchoolsDetailFormContext();

	//
	// B. Render components

	return (
		<Collapsible
			description={t('schools:create.SchoolCreateSectionOrganization.description')}
			title={t('schools:create.SchoolCreateSectionOrganization.title')}
		>
			<Section padding="lg">
				<Grid columns="ab" gap="md">
					<StandardFormController
						control={form.control}
						name="email"
						render={({ field, fieldState }) => (
							<TextInput
								disabled={!capabilities?.editEnabled}
								error={fieldState.error?.message}
								label={t('schools:create.SchoolCreateSectionOrganization.fields.email.label')}
								onBlur={field.onBlur}
								onChange={e => field.onChange(e.currentTarget.value)}
								placeholder={t('schools:create.SchoolCreateSectionOrganization.fields.email.placeholder')}
								value={field.value ?? ''}
								w="100%"
							/>
						)}
					/>

					<StandardFormController
						control={form.control}
						name="url"
						render={({ field, fieldState }) => (
							<TextInput
								disabled={!capabilities?.editEnabled}
								error={fieldState.error?.message}
								label={t('schools:create.SchoolCreateSectionOrganization.fields.url.label')}
								onBlur={field.onBlur}
								onChange={e => field.onChange(e.currentTarget.value)}
								placeholder={t('schools:create.SchoolCreateSectionOrganization.fields.url.placeholder')}
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
