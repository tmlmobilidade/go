'use client';

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
					<TextInput
						key={userDetailContext.data.form.key('first_name')}
						label={t('default:users.detail.BasicInfo.fields.first_name.label')}
						maxLength={255}
						placeholder={t('default:users.detail.BasicInfo.fields.first_name.placeholder')}
						readOnly={userDetailContext.flags.isReadOnly}
						withAsterisk={!CreateUserSchema.shape.first_name.isOptional()}
						{...userDetailContext.data.form.getInputProps('first_name')}
					/>
					<TextInput
						key={userDetailContext.data.form.key('last_name')}
						label={t('default:users.detail.BasicInfo.fields.last_name.label')}
						maxLength={255}
						placeholder={t('default:users.detail.BasicInfo.fields.last_name.placeholder')}
						readOnly={userDetailContext.flags.isReadOnly}
						withAsterisk={!CreateUserSchema.shape.last_name.isOptional()}
						{...userDetailContext.data.form.getInputProps('last_name')}
					/>
					<TextInput
						key={userDetailContext.data.form.key('email')}
						label={t('default:users.detail.BasicInfo.fields.email.label')}
						leftSection={<IconMail size={22} />}
						placeholder={t('default:users.detail.BasicInfo.fields.email.placeholder')}
						readOnly={userDetailContext.flags.isReadOnly}
						withAsterisk={!CreateUserSchema.shape.email.isOptional()}
						{...userDetailContext.data.form.getInputProps('email')}
					/>
					<TextInput
						key={userDetailContext.data.form.key('phone')}
						label={t('default:users.detail.BasicInfo.fields.phone.label')}
						leftSection={<IconPhone size={22} />}
						placeholder={t('default:users.detail.BasicInfo.fields.phone.placeholder')}
						readOnly={userDetailContext.flags.isReadOnly}
						withAsterisk={!CreateUserSchema.shape.phone.isOptional()}
						{...userDetailContext.data.form.getInputProps('phone')}
					/>
					<PasswordInput
						key={userDetailContext.data.form.key('password')}
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
