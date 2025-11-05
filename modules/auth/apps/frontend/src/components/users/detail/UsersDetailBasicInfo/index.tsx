'use client';

/* * */

import { useUsersDetailContext } from '@/contexts/UsersDetail.context';
import { CreateUserSchema } from '@tmlmobilidade/types';
import { IconMail, IconPhone } from '@tabler/icons-react';
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
						label="Primeiro Nome"
						maxLength={255}
						placeholder="..."
						withAsterisk={!CreateUserSchema.shape.first_name.isOptional()}
						{...usersDetailContext.data.form.getInputProps('first_name')}
					/>
					<TextInput
						label="Último Nome"
						maxLength={255}
						placeholder="..."
						withAsterisk={!CreateUserSchema.shape.last_name.isOptional()}
						{...usersDetailContext.data.form.getInputProps('last_name')}
					/>
					<TextInput
						label="Email"
						leftSection={<IconMail size={18} />}
						placeholder="user@example.com"
						withAsterisk={!CreateUserSchema.shape.email.isOptional()}
						{...usersDetailContext.data.form.getInputProps('email')}
					/>
					<TextInput
						label="Telemóvel"
						leftSection={<IconPhone size={18} />}
						placeholder="912345678"
						withAsterisk={!CreateUserSchema.shape.phone.isOptional()}
						{...usersDetailContext.data.form.getInputProps('phone')}
					/>
					<PasswordInput
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
