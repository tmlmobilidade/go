'use client';

import { Collapsible, Grid, Section, StandardFormController, TextInput } from '@tmlmobilidade/ui';
import { useTranslation } from 'react-i18next';

import { useSchoolsCreateFormContext } from '../../shared/SchoolsCreateForm.context';

/* * */

export function SchoolCreateSectionAddress() {
	//

	//
	// A. Setup variables

	const { t } = useTranslation();
	const { form } = useSchoolsCreateFormContext();

	//
	// B. Render components

	return (
		<Collapsible
			description={t('schools:create.SchoolCreateSectionAddress.description')}
			title={t('schools:create.SchoolCreateSectionAddress.title')}
		>
			<Section gap="sm">
				<Grid columns="ab" gap="md">
					{(['address', 'locality', 'parish_name', 'postal_code'] as const).map(name => (
						<StandardFormController
							key={name}
							control={form.control}
							name={name}
							render={({ field, fieldState }) => (
								<TextInput
									error={fieldState.error?.message}
									label={t(`schools:create.SchoolCreateSectionAddress.fields.${name}.label`)}
									onBlur={field.onBlur}
									onChange={e => field.onChange(e.currentTarget.value)}
									placeholder={t(`schools:create.SchoolCreateSectionAddress.fields.${name}.placeholder`)}
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
