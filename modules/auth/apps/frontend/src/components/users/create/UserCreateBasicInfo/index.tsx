'use client';

/* * */

import { useUserCreateContext } from '@/contexts/UserCreate.context';
import { IconMail, IconPhone } from '@tabler/icons-react';
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
				<TextInput
					key={userCreateContext.data.form.key('email')}
					label="Email"
					leftSection={<IconMail size={22} />}
					placeholder="user@example.com"
					withAsterisk={!CreateUserSchema.shape.email.isOptional()}
					{...userCreateContext.data.form.getInputProps('email')}
				/>
				<TextInput
					key={userCreateContext.data.form.key('phone')}
					label="Telemóvel"
					leftSection={<IconPhone size={22} />}
					placeholder="912345678"
					withAsterisk={!CreateUserSchema.shape.phone.isOptional()}
					{...userCreateContext.data.form.getInputProps('phone')}
				/>
			</Grid>
		</Section>
	);

	//
}
