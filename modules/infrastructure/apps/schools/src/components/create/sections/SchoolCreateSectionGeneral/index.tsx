'use client';

import { useSchoolsCreateFormContext } from '@/components/create/shared/SchoolsCreateForm.context';
import { Collapsible, Grid, Section, StandardFormController, TextInput } from '@tmlmobilidade/ui';
import { useTranslation } from 'react-i18next';

/* * */

export function SchoolCreateSectionGeneral() {
	//

	//
	// A. Setup variables

	const { t } = useTranslation();

	const { form: schoolsCreateForm } = useSchoolsCreateFormContext();

	//
	// B. Render components

	return (
		<Collapsible
			description={t('schools:create.SchoolCreateSectionGeneral.description')}
			title={t('schools:create.SchoolCreateSectionGeneral.title')}
		>
			<Section padding="lg">
				<Grid columns="abc" gap="md">
					<StandardFormController
						control={schoolsCreateForm.control}
						name="code"
						render={({ field }) => (
							<TextInput
								label={t('schools:create.SchoolCreateSectionGeneral.code.label')}
								onBlur={field.onBlur}
								onChange={e => field.onChange(e.currentTarget.value)}
								placeholder={t('schools:create.SchoolCreateSectionGeneral.code.placeholder')}
								value={String(field.value)}
								w="100%"
							/>
						)}
					/>
				</Grid>
			</Section>
		</Collapsible>
	);
}
