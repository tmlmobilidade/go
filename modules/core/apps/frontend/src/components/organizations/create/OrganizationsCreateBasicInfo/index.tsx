'use client';

import { CreateOrganizationSchema } from '@tmlmobilidade/go-types-core';
import { Grid, Section, StandardFormController, TextInput } from '@tmlmobilidade/ui';
import { useTranslation } from 'react-i18next';

import { useOrganizationsCreateFormContext } from '../OrganizationsCreateForm.context';

/* * */

export function OrganizationsCreateBasicInfo() {
	//

	//
	// A. Setup variables

	const { t } = useTranslation();

	const { capabilities, form } = useOrganizationsCreateFormContext();

	//
	// B. Render components

	return (
		<Section gap="md">
			<Grid columns="a" gap="xl">

				<StandardFormController
					control={form.control}
					name="long_name"
					render={({ field, fieldState }) => (
						<TextInput
							disabled={!capabilities.editEnabled}
							error={fieldState.error?.message}
							label={t('default:organizations.create.SectionBasicInfo.fields.long_name.label')}
							maxLength={CreateOrganizationSchema.shape.long_name.maxLength}
							onBlur={field.onBlur}
							onChange={e => field.onChange(e.currentTarget.value)}
							placeholder={t('default:organizations.create.SectionBasicInfo.fields.long_name.placeholder')}
							value={field.value ?? ''}
							data-autofocus
							withAsterisk
						/>
					)}
				/>

				<StandardFormController
					control={form.control}
					name="short_name"
					render={({ field, fieldState }) => (
						<TextInput
							disabled={!capabilities.editEnabled}
							error={fieldState.error?.message}
							label={t('default:organizations.create.SectionBasicInfo.fields.short_name.label')}
							maxLength={CreateOrganizationSchema.shape.short_name.maxLength}
							onBlur={field.onBlur}
							onChange={e => field.onChange(e.currentTarget.value)}
							placeholder={t('default:organizations.create.SectionBasicInfo.fields.short_name.placeholder')}
							value={field.value ?? ''}
							withAsterisk
						/>
					)}
				/>

			</Grid>
		</Section>
	);
}
