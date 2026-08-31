'use client';

import { useSchoolsDetailFormContext } from '@/components/schools/detail/SchoolsDetailForm.context';
import { Collapsible, Grid, Section, StandardFormController, TextInput } from '@tmlmobilidade/ui';
import { useTranslation } from 'react-i18next';

/* * */

export function SchoolDetailSectionAddress() {
	//

	//
	// A. Setup variables

	const { t } = useTranslation();

	const { capabilities, form } = useSchoolsDetailFormContext();

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
									disabled={!capabilities?.editEnabled}
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
