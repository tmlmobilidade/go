'use client';

import { Collapsible, Grid, Section, StandardFormController, TextInput } from '@tmlmobilidade/ui';
import { useTranslation } from 'react-i18next';

import { useRolesDetailFormContext } from '../RolesDetailForm.context';

/* * */

export function RolesDetailBasicInfo() {
	//

	//
	// A. Setup variables

	const { t } = useTranslation();

	const { capabilities, form } = useRolesDetailFormContext();

	//
	// B. Render components

	return (
		<Collapsible
			description={t('default:roles.detail.BasicInfo.description')}
			title={t('default:roles.detail.BasicInfo.title')}
		>
			<Section gap="md">
				<Grid columns="ab" gap="xl">
					<StandardFormController
						control={form.control}
						name="name"
						render={({ field, fieldState }) => (
							<TextInput
								disabled={!capabilities.editEnabled}
								error={fieldState.error?.message}
								label={t('default:roles.detail.BasicInfo.fields.name.label')}
								maxLength={255}
								onBlur={field.onBlur}
								onChange={e => field.onChange(e.currentTarget.value)}
								placeholder={t('default:roles.detail.BasicInfo.fields.name.placeholder')}
								value={field.value ?? ''}
								data-autofocus
								withAsterisk
							/>
						)}
					/>
				</Grid>
			</Section>
		</Collapsible>
	);
}
