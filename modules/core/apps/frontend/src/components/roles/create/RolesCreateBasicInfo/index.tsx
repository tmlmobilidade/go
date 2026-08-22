'use client';

import { StandardFormController, Grid, Section, TextInput } from '@tmlmobilidade/ui';
import { useTranslation } from 'react-i18next';

import { useRolesCreateFormContext } from '../RolesCreateForm.context';

/* * */

export function RolesCreateBasicInfo() {
	//

	//
	// A. Setup variables

	const { t } = useTranslation();

	const { form } = useRolesCreateFormContext();

	//
	// B. Render components

	return (
		<Section gap="md">
			<Grid columns="a" gap="xl">
				<StandardFormController
					control={form.control}
					name="name"
					render={({ field, fieldState }) => (
						<TextInput
							error={fieldState.error?.message}
							label={t('default:roles.create.BasicInfo.fields.name.label')}
							maxLength={255}
							onBlur={field.onBlur}
							onChange={e => field.onChange(e.currentTarget.value)}
							placeholder={t('default:roles.create.BasicInfo.fields.name.placeholder')}
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
