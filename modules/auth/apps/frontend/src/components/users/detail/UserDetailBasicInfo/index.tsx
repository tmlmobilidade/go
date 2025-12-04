'use client';

/* * */

import { useUserDetailContext } from '@/contexts/UserDetail.context';
import { IconMail, IconPhone } from '@tabler/icons-react';
import { CreateUserSchema } from '@tmlmobilidade/types';
import { Collapsible, Grid, PasswordInput, Section, TextInput } from '@tmlmobilidade/ui';

/* * */

export function UserDetailBasicInfo() {
	//

	//
	// A. Setup variables

	const userDetailContext = useUserDetailContext();

	//
	// B. Render components

	return (
		<Collapsible
			description="Informação básica do utilizador"
			title="Informação Básica"
		>
			<Section gap="md">
				<Grid columns="ab" gap="xl">
					<TextInput
						key={userDetailContext.data.form.key('first_name')}
						label="Primeiro Nome"
						maxLength={255}
						placeholder="..."
						withAsterisk={!CreateUserSchema.shape.first_name.isOptional()}
						{...userDetailContext.data.form.getInputProps('first_name')}
					/>
					<TextInput
						key={userDetailContext.data.form.key('last_name')}
						label="Último Nome"
						maxLength={255}
						placeholder="..."
						withAsterisk={!CreateUserSchema.shape.last_name.isOptional()}
						{...userDetailContext.data.form.getInputProps('last_name')}
					/>
					<TextInput
						key={userDetailContext.data.form.key('email')}
						label="Email"
						leftSection={<IconMail size={22} />}
						placeholder="user@example.com"
						withAsterisk={!CreateUserSchema.shape.email.isOptional()}
						{...userDetailContext.data.form.getInputProps('email')}
					/>
					<TextInput
						key={userDetailContext.data.form.key('phone')}
						label="Telemóvel"
						leftSection={<IconPhone size={22} />}
						placeholder="912345678"
						withAsterisk={!CreateUserSchema.shape.phone.isOptional()}
						{...userDetailContext.data.form.getInputProps('phone')}
					/>
					<PasswordInput
						key={userDetailContext.data.form.key('password')}
						autoComplete="new-password"
						label="Change Password"
						onChange={event => userDetailContext.actions.handleChangePassword(event.target.value)}
						placeholder="..."
					/>
				</Grid>
			</Section>
		</Collapsible>
	);

	//
}
