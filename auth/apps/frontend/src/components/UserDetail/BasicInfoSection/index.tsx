'use client';

import { useUserDetailContext } from '@/contexts/UserDetail.context';
import { IconMail, IconPhone } from '@tabler/icons-react';
import { CreateUserSchema } from '@tmlmobilidade/core-types';
import { Grid, Section, Surface, TextInput } from '@tmlmobilidade/ui';
export default function BasicInfoSection() {
	const { data: userDetailData } = useUserDetailContext();

	return (
		<Section
			description="Informação básica do utilizador"
			title="Informação Básica"
		>
			<Surface gap="md" padding="md">
				<Grid columns="ab" gap="xl">
					<TextInput
						label="Primeiro Nome"
						maxLength={255}
						placeholder="..."
						withAsterisk={!CreateUserSchema.shape.first_name.isOptional()}
						{...userDetailData.form.getInputProps('first_name')}
					/>
					<TextInput
						label="Último Nome"
						maxLength={255}
						placeholder="..."
						withAsterisk={!CreateUserSchema.shape.last_name.isOptional()}
						{...userDetailData.form.getInputProps('last_name')}
					/>
					<TextInput
						label="Email"
						leftSection={<IconMail size={18} />}
						placeholder="user@example.com"
						withAsterisk={!CreateUserSchema.shape.email.isOptional()}
						{...userDetailData.form.getInputProps('email')}
					/>
					<TextInput
						label="Telemóvel"
						leftSection={<IconPhone size={18} />}
						placeholder="912345678"
						withAsterisk={!CreateUserSchema.shape.phone.isOptional()}
						{...userDetailData.form.getInputProps('phone')}
					/>
				</Grid>
			</Surface>
		</Section>
	);
}
