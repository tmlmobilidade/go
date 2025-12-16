'use client';

/* * */

import { useUserDetailContext } from '@/contexts/UserDetail.context';
import { IconMail, IconPhone } from '@tabler/icons-react';
import { CreateUserSchema } from '@tmlmobilidade/types';
import { Collapsible, Grid, PasswordInput, Section, TextInput } from '@tmlmobilidade/ui';
import { useTranslation } from 'react-i18next';

/* * */

export function UserDetailBasicInfo() {
	//

	//
	// A. Setup variables

	const userDetailContext = useUserDetailContext();
	const { t } = useTranslation('auth', { keyPrefix: 'users.detail.BasicInfo' });

	//
	// B. Render components

	return (
		<Collapsible
			description={t('description')}
			title={t('title')}
		>
			<Section gap="md">
				<Grid columns="ab" gap="xl">
					<TextInput
						key={userDetailContext.data.form.key('first_name')}
						label={t('fields.first_name')}
						maxLength={255}
						placeholder={t('fields.first_name_placeholder')}
						withAsterisk={!CreateUserSchema.shape.first_name.isOptional()}
						{...userDetailContext.data.form.getInputProps('first_name')}
					/>
					<TextInput
						key={userDetailContext.data.form.key('last_name')}
						label={t('fields.last_name')}
						maxLength={255}
						placeholder={t('fields.last_name_placeholder')}
						withAsterisk={!CreateUserSchema.shape.last_name.isOptional()}
						{...userDetailContext.data.form.getInputProps('last_name')}
					/>
					<TextInput
						key={userDetailContext.data.form.key('email')}
						label={t('fields.email')}
						leftSection={<IconMail size={22} />}
						placeholder={t('fields.email_placeholder')}
						withAsterisk={!CreateUserSchema.shape.email.isOptional()}
						{...userDetailContext.data.form.getInputProps('email')}
					/>
					<TextInput
						key={userDetailContext.data.form.key('phone')}
						label={t('fields.phone')}
						leftSection={<IconPhone size={22} />}
						placeholder={t('fields.phone_placeholder')}
						withAsterisk={!CreateUserSchema.shape.phone.isOptional()}
						{...userDetailContext.data.form.getInputProps('phone')}
					/>
					<PasswordInput
						key={userDetailContext.data.form.key('password')}
						autoComplete="new-password"
						label={t('fields.change_password')}
						onChange={event => userDetailContext.actions.handleChangePassword(event.target.value)}
						placeholder={t('fields.password_placeholder')}
					/>
				</Grid>
			</Section>
		</Collapsible>
	);

	//
}
