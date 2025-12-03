'use client';

/* * */

import { useUsersDetailContext } from '@/contexts/UsersDetail.context';
import { IconMail, IconPhone } from '@tabler/icons-react';
import { CreateUserSchema } from '@tmlmobilidade/types';
import { Collapsible, Grid, PasswordInput, Section, TextInput } from '@tmlmobilidade/ui';

/* * */

export function UsersDetailBasicInfo() {
	//

	//
	// A. Setup variables

	const usersDetailContext = useUsersDetailContext();

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
						key={usersDetailContext.data.form.key('first_name')}
						label="Primeiro Nome"
						maxLength={255}
						placeholder="..."
						withAsterisk={!CreateUserSchema.shape.first_name.isOptional()}
						{...usersDetailContext.data.form.getInputProps('first_name')}
					/>
					<TextInput
						key={usersDetailContext.data.form.key('last_name')}
						label="Último Nome"
						maxLength={255}
						placeholder="..."
						withAsterisk={!CreateUserSchema.shape.last_name.isOptional()}
						{...usersDetailContext.data.form.getInputProps('last_name')}
					/>
					<TextInput
						key={usersDetailContext.data.form.key('email')}
						label="Email"
						leftSection={<IconMail size={18} />}
						placeholder="user@example.com"
						withAsterisk={!CreateUserSchema.shape.email.isOptional()}
						{...usersDetailContext.data.form.getInputProps('email')}
					/>
					<TextInput
						key={usersDetailContext.data.form.key('phone')}
						label="Telemóvel"
						leftSection={<IconPhone size={18} />}
						placeholder="912345678"
						withAsterisk={!CreateUserSchema.shape.phone.isOptional()}
						{...usersDetailContext.data.form.getInputProps('phone')}
					/>
					<PasswordInput
						key={usersDetailContext.data.form.key('password')}
						autoComplete="new-password"
						label="Change Password"
						onChange={event => usersDetailContext.actions.handleChangePassword(event.target.value)}
						placeholder="..."
					/>
				</Grid>
			</Section>
		</Collapsible>
	);

	//
}
