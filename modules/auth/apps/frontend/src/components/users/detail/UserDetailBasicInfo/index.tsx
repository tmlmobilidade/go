'use client';

import { useUserDetailContext } from '@/components/users/detail/UserDetail.context';
import { IconMail, IconPhone } from '@tabler/icons-react';
import { CreateUserSchema } from '@tmlmobilidade/types';
import { Collapsible, ContextFormController, Grid, PasswordInput, Section, TextInput } from '@tmlmobilidade/ui';
import { useTranslation } from 'react-i18next';

/* * */

export function UserDetailBasicInfo() {
	//

	//
	// A. Setup variables

	const userDetailContext = useUserDetailContext();
	const { t } = useTranslation();

	//
	// B. Render components

	return (
		<Collapsible
			description={t('default:users.detail.BasicInfo.description')}
			title={t('default:users.detail.BasicInfo.title')}
		>
			<Section gap="md">
				<Grid columns="ab" gap="xl">
					<ContextFormController
						control={userDetailContext.form.instance.control}
						name="first_name"
						render={({ field, fieldState }) => (
							<TextInput
								defaultValue={field.value}
								error={fieldState.error?.message}
								label={t('default:users.detail.BasicInfo.fields.first_name.label')}
								maxLength={255}
								onBlur={field.onBlur}
								onChange={field.onChange}
								placeholder={t('default:users.detail.BasicInfo.fields.first_name.placeholder')}
								readOnly={userDetailContext.flags.isReadOnly}
								value={field.value}
								withAsterisk={!CreateUserSchema.shape.first_name.isOptional()}
							/>
						)}
					/>
					<ContextFormController
						control={userDetailContext.form.instance.control}
						name="last_name"
						render={({ field, fieldState }) => (
							<TextInput
								defaultValue={field.value}
								error={fieldState.error?.message}
								label={t('default:users.detail.BasicInfo.fields.last_name.label')}
								maxLength={255}
								onBlur={field.onBlur}
								onChange={field.onChange}
								placeholder={t('default:users.detail.BasicInfo.fields.last_name.placeholder')}
								readOnly={userDetailContext.flags.isReadOnly}
								value={field.value}
								withAsterisk={!CreateUserSchema.shape.last_name.isOptional()}
							/>
						)}
					/>
					<ContextFormController
						control={userDetailContext.form.instance.control}
						name="email"
						render={({ field, fieldState }) => (
							<TextInput
								defaultValue={field.value}
								error={fieldState.error?.message}
								label={t('default:users.detail.BasicInfo.fields.email.label')}
								leftSection={<IconMail size={22} />}
								onBlur={field.onBlur}
								onChange={field.onChange}
								placeholder={t('default:users.detail.BasicInfo.fields.email.placeholder')}
								readOnly={userDetailContext.flags.isReadOnly}
								value={field.value}
								withAsterisk={!CreateUserSchema.shape.email.isOptional()}
							/>
						)}
					/>
					<ContextFormController
						control={userDetailContext.form.instance.control}
						name="phone"
						render={({ field, fieldState }) => (
							<TextInput
								defaultValue={field.value}
								error={fieldState.error?.message}
								label={t('default:users.detail.BasicInfo.fields.phone.label')}
								leftSection={<IconPhone size={22} />}
								onBlur={field.onBlur}
								onChange={field.onChange}
								placeholder={t('default:users.detail.BasicInfo.fields.phone.placeholder')}
								readOnly={userDetailContext.flags.isReadOnly}
								value={field.value}
								withAsterisk={!CreateUserSchema.shape.phone.isOptional()}
							/>
						)}
					/>
					<PasswordInput
						autoComplete="new-password"
						label={t('default:users.detail.BasicInfo.fields.password.label')}
						onChange={event => userDetailContext.actions.handleChangePassword(event.target.value)}
						placeholder={t('default:users.detail.BasicInfo.fields.password.placeholder')}
						readOnly={userDetailContext.flags.isReadOnly}
					/>
				</Grid>
			</Section>
		</Collapsible>
	);

	//
}
