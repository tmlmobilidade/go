'use client';

import { ContextFormController, Grid, Section, TextInput } from '@tmlmobilidade/ui';
import { useTranslation } from 'react-i18next';

import { useOrganizationsCreateFormContext } from '../OrganizationsCreateForm.context';

/* * */

export function OrganizationsCreateBasicInfo() {
	//

	//
	// A. Setup variables

	const { t } = useTranslation();

	const { form } = useOrganizationsCreateFormContext();

	//
	// B. Render components

	return (
		<Section gap="md">
			<Grid columns="a" gap="xl">

				<ContextFormController
					control={form.control}
					name="long_name"
					render={({ field, fieldState }) => (
						<TextInput
							error={fieldState.error?.message}
							label={t('default:organizations.create.SectionBasicInfo.fields.long_name.label')}
							maxLength={255}
							onBlur={field.onBlur}
							onChange={e => field.onChange(e.currentTarget.value)}
							placeholder={t('default:organizations.create.SectionBasicInfo.fields.long_name.placeholder')}
							value={field.value ?? ''}
							data-autofocus
							withAsterisk
						/>
					)}
				/>
			</Grid>
		</Section>
	);
}
