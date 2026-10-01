'use client';

import { useUsersCreateFormContext } from '@/components/users/create/UsersCreateForm.context';
import { IconMail } from '@tabler/icons-react';
import { CreateUserSchema } from '@tmlmobilidade/go-types-core';
import { Grid, Section, StandardFormController, TextInput } from '@tmlmobilidade/ui';
import { useTranslation } from 'react-i18next';

/* * */

export function UsersCreateBasicInfo() {
	//

	//
	// A. Setup variables

	const { t } = useTranslation();

	const { capabilities, form } = useUsersCreateFormContext();

	//
	// B. Render components

	return (
		<Section gap="md">

			<Grid columns="ab" gap="xl">
				<StandardFormController
					control={form.control}
					name="first_name"
					render={({ field, fieldState }) => (
						<TextInput
							disabled={!capabilities.editEnabled}
							error={fieldState.error?.message}
							label={t('default:users.create.BasicInfo.fields.first_name.label')}
							maxLength={CreateUserSchema.shape.first_name.maxLength}
							onBlur={field.onBlur}
							onChange={e => field.onChange(e.currentTarget.value)}
							placeholder={t('default:users.create.BasicInfo.fields.first_name.placeholder')}
							value={field.value ?? ''}
							data-autofocus
							withAsterisk
						/>
					)}
				/>
				<StandardFormController
					control={form.control}
					name="last_name"
					render={({ field, fieldState }) => (
						<TextInput
							disabled={!capabilities.editEnabled}
							error={fieldState.error?.message}
							label={t('default:users.create.BasicInfo.fields.last_name.label')}
							maxLength={CreateUserSchema.shape.last_name.maxLength}
							onBlur={field.onBlur}
							onChange={e => field.onChange(e.currentTarget.value)}
							placeholder={t('default:users.create.BasicInfo.fields.last_name.placeholder')}
							value={field.value ?? ''}
							data-autofocus
							withAsterisk
						/>
					)}
				/>
			</Grid>

			<Grid columns="a" gap="xl">
				<StandardFormController
					control={form.control}
					name="email"
					render={({ field, fieldState }) => (
						<TextInput
							disabled={!capabilities.editEnabled}
							error={fieldState.error?.message}
							label={t('default:users.create.BasicInfo.fields.email.label')}
							leftSection={<IconMail size={22} />}
							maxLength={CreateUserSchema.shape.email.maxLength}
							onBlur={field.onBlur}
							onChange={e => field.onChange(e.currentTarget.value)}
							placeholder={t('default:users.create.BasicInfo.fields.email.placeholder')}
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
