'use client';

/* * */

import { useUserDetailContext } from '@/components/users/detail/UserDetail.context';
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
						label={t('fields.firstName')}
						maxLength={255}
						placeholder={t('fields.firstNamePlaceholder')}
						readOnly={userDetailContext.flags.isReadOnly}
						withAsterisk={!CreateUserSchema.shape.first_name.isOptional()}
						{...userDetailContext.data.form.getInputProps('first_name')}
					/>
					<TextInput
						key={userDetailContext.data.form.key('last_name')}
						label={t('fields.lastName')}
						maxLength={255}
						placeholder={t('fields.lastNamePlaceholder')}
						readOnly={userDetailContext.flags.isReadOnly}
						withAsterisk={!CreateUserSchema.shape.last_name.isOptional()}
						{...userDetailContext.data.form.getInputProps('last_name')}
					/>
					<TextInput
						key={userDetailContext.data.form.key('email')}
						label={t('fields.email')}
						leftSection={<IconMail size={22} />}
						placeholder={t('fields.emailPlaceholder')}
						readOnly={userDetailContext.flags.isReadOnly}
						withAsterisk={!CreateUserSchema.shape.email.isOptional()}
						{...userDetailContext.data.form.getInputProps('email')}
					/>
					<TextInput
						key={userDetailContext.data.form.key('phone')}
						label={t('fields.phone')}
						leftSection={<IconPhone size={22} />}
						placeholder={t('fields.phonePlaceholder')}
						readOnly={userDetailContext.flags.isReadOnly}
						withAsterisk={!CreateUserSchema.shape.phone.isOptional()}
						{...userDetailContext.data.form.getInputProps('phone')}
					/>
					<PasswordInput
						key={userDetailContext.data.form.key('password')}
						autoComplete="new-password"
						label={t('fields.changePassword')}
						onChange={event => userDetailContext.actions.handleChangePassword(event.target.value)}
						placeholder={t('fields.passwordPlaceholder')}
						readOnly={userDetailContext.flags.isReadOnly}
					/>
				</Grid>
			</Section>
		</Collapsible>
	);

	//
}
