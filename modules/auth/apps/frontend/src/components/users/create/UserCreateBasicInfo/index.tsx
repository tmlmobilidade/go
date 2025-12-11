'use client';

/* * */

import { useUserCreateContext } from '@/components/users/create/UserCreate.context';
import { IconMail } from '@tabler/icons-react';
import { CreateUserSchema } from '@tmlmobilidade/types';
import { Grid, Section, TextInput } from '@tmlmobilidade/ui';

/* * */

export function UserCreateBasicInfo() {
	//

	//
	// A. Setup variables

	const userCreateContext = useUserCreateContext();

	//
	// B. Render components

	return (
		<Section gap="md">
			<Grid columns="ab" gap="xl">
				<TextInput
					key={userCreateContext.data.form.key('first_name')}
					label="Primeiro Nome"
					maxLength={255}
					placeholder="..."
					withAsterisk={!CreateUserSchema.shape.first_name.isOptional()}
					data-autofocus
					{...userCreateContext.data.form.getInputProps('first_name')}
				/>
				<TextInput
					key={userCreateContext.data.form.key('last_name')}
					label="Último Nome"
					maxLength={255}
					placeholder="..."
					withAsterisk={!CreateUserSchema.shape.last_name.isOptional()}
					{...userCreateContext.data.form.getInputProps('last_name')}
				/>
			</Grid>
			<Grid columns="a" gap="xl">
				<TextInput
					key={userCreateContext.data.form.key('email')}
					label="Email"
					leftSection={<IconMail size={22} />}
					placeholder="user@example.com"
					withAsterisk={!CreateUserSchema.shape.email.isOptional()}
					{...userCreateContext.data.form.getInputProps('email')}
				/>
			</Grid>
		</Section>
	);

	//
}
