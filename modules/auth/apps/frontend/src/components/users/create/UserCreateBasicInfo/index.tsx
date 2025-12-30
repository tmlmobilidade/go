'use client';

/* * */

import { useUserCreateContext } from '@/components/users/create/UserCreate.context';
import { IconMail } from '@tabler/icons-react';
import { CreateUserSchema } from '@tmlmobilidade/types';
import { Grid, Section, TextInput } from '@tmlmobilidade/ui';
import { useTranslation } from 'react-i18next';

/* * */

export function UserCreateBasicInfo() {
	//

	//
	// A. Setup variables

	const userCreateContext = useUserCreateContext();
	const { t } = useTranslation('auth', { keyPrefix: 'users.create.basicInfo' });

	//
	// B. Render components

	return (
		<Section gap="md">
			<Grid columns="ab" gap="xl">
				<TextInput
					key={userCreateContext.data.form.key('first_name')}
					label={t('fields.firstName')}
					maxLength={255}
					placeholder={t('fields.firstNamePlaceholder')}
					withAsterisk={!CreateUserSchema.shape.first_name.isOptional()}
					data-autofocus
					{...userCreateContext.data.form.getInputProps('first_name')}
				/>
				<TextInput
					key={userCreateContext.data.form.key('last_name')}
					label={t('fields.lastName')}
					maxLength={255}
					placeholder={t('fields.lastNamePlaceholder')}
					withAsterisk={!CreateUserSchema.shape.last_name.isOptional()}
					{...userCreateContext.data.form.getInputProps('last_name')}
				/>
			</Grid>
			<Grid columns="a" gap="xl">
				<TextInput
					key={userCreateContext.data.form.key('email')}
					label={t('fields.email')}
					leftSection={<IconMail size={22} />}
					placeholder={t('fields.emailPlaceholder')}
					withAsterisk={!CreateUserSchema.shape.email.isOptional()}
					{...userCreateContext.data.form.getInputProps('email')}
				/>
			</Grid>
		</Section>
	);

	//
}
