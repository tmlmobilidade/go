'use client';

import { useRoleDetailContext } from '@/contexts/RoleDetail.context';
import { IconMail, IconPhone } from '@tabler/icons-react';
import { Grid, Section, Surface, TextInput } from '@tmlmobilidade/ui';

export default function BasicInfoSection() {
	const { data: userDetailData } = useRoleDetailContext();

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
						withAsterisk
						{...userDetailData.form.getInputProps('first_name')}
					/>
					<TextInput
						label="Último Nome"
						maxLength={255}
						placeholder="..."
						withAsterisk
						{...userDetailData.form.getInputProps('last_name')}
					/>
					<TextInput
						label="Email"
						leftSection={<IconMail size={18} />}
						placeholder="user@example.com"
						withAsterisk
						{...userDetailData.form.getInputProps('email')}
					/>
					<TextInput
						label="Telemóvel"
						leftSection={<IconPhone size={18} />}
						placeholder="912345678"
						withAsterisk
						{...userDetailData.form.getInputProps('phone')}
					/>
				</Grid>
			</Surface>
		</Section>
	);
}
