'use client';

import { IconMail, IconPhone } from '@tabler/icons-react';
import { Collapsible, Grid, PasswordInput, Section, StandardFormController, TextInput } from '@tmlmobilidade/ui';
import bcrypt from 'bcryptjs';
import { useTranslation } from 'react-i18next';

import { useUsersDetailFormContext } from '../UsersDetailForm.context';

/* * */

export function UsersDetailBasicInfo() {
	//

	//
	// A. Setup variables

	const { t } = useTranslation();

	const { capabilities, form } = useUsersDetailFormContext();

	//
	// B. Handle actions

	function handleChangePassword(value: string) {
		const passwordHash = bcrypt.hashSync(value);
		form.setValue('password_hash', passwordHash, { shouldDirty: true });
	}

	//
	// C. Render components

	return (
		<Collapsible
			description={t('default:users.detail.BasicInfo.description')}
			title={t('default:users.detail.BasicInfo.title')}
		>
			<Section gap="md">
				<Grid columns="ab" gap="xl">

					<StandardFormController
						control={form.control}
						name="first_name"
						render={({ field, fieldState }) => (
							<TextInput
								disabled={!capabilities.editEnabled}
								error={fieldState.error?.message}
								label={t('default:users.detail.BasicInfo.fields.first_name.label')}
								maxLength={255}
								onBlur={field.onBlur}
								onChange={e => field.onChange(e.currentTarget.value)}
								placeholder={t('default:users.detail.BasicInfo.fields.first_name.placeholder')}
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
								label={t('default:users.detail.BasicInfo.fields.last_name.label')}
								maxLength={255}
								onBlur={field.onBlur}
								onChange={e => field.onChange(e.currentTarget.value)}
								placeholder={t('default:users.detail.BasicInfo.fields.last_name.placeholder')}
								value={field.value ?? ''}
								withAsterisk
							/>
						)}
					/>

					<StandardFormController
						control={form.control}
						name="email"
						render={({ field, fieldState }) => (
							<TextInput
								disabled={!capabilities.editEnabled}
								error={fieldState.error?.message}
								label={t('default:users.detail.BasicInfo.fields.email.label')}
								leftSection={<IconMail size={22} />}
								maxLength={255}
								onBlur={field.onBlur}
								onChange={e => field.onChange(e.currentTarget.value)}
								placeholder={t('default:users.detail.BasicInfo.fields.email.placeholder')}
								type="email"
								value={field.value ?? ''}
								withAsterisk
							/>
						)}
					/>

					<StandardFormController
						control={form.control}
						name="phone"
						render={({ field, fieldState }) => (
							<TextInput
								disabled={!capabilities.editEnabled}
								error={fieldState.error?.message}
								label={t('default:users.detail.BasicInfo.fields.phone.label')}
								leftSection={<IconPhone size={22} />}
								maxLength={255}
								onBlur={field.onBlur}
								onChange={e => field.onChange(e.currentTarget.value)}
								placeholder={t('default:users.detail.BasicInfo.fields.phone.placeholder')}
								type="phone"
								value={field.value ?? ''}
								withAsterisk
							/>
						)}
					/>

					<PasswordInput
						autoComplete="new-password"
						disabled={!capabilities.editEnabled}
						label={t('default:users.detail.BasicInfo.fields.password.label')}
						maxLength={255}
						onChange={event => handleChangePassword(event.target.value)}
						placeholder={t('default:users.detail.BasicInfo.fields.password.placeholder')}
					/>

				</Grid>
			</Section>
		</Collapsible>
	);
}
