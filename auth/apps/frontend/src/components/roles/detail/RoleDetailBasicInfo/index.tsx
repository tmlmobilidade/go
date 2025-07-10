'use client';

/* * */

import { useRoleDetailContext } from '@/contexts/RoleDetail.context';
import { IconMail, IconPhone } from '@tabler/icons-react';
import { Collapsible, Grid, Section, TextInput } from '@tmlmobilidade/ui';

/* * */

export function RoleDetailBasicInfo() {
	//

	//
	// A. Setup variables

	const roleDetailContext = useRoleDetailContext();

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
						withAsterisk
						{...roleDetailContext.data.form.getInputProps('first_name')}
					/>
					<TextInput
						label="Último Nome"
						maxLength={255}
						placeholder="..."
						withAsterisk
						{...roleDetailContext.data.form.getInputProps('last_name')}
					/>
					<TextInput
						label="Email"
						leftSection={<IconMail size={18} />}
						placeholder="user@example.com"
						withAsterisk
						{...roleDetailContext.data.form.getInputProps('email')}
					/>
					<TextInput
						label="Telemóvel"
						leftSection={<IconPhone size={18} />}
						placeholder="912345678"
						withAsterisk
						{...roleDetailContext.data.form.getInputProps('phone')}
					/>
				</Grid>
			</Section>
		</Collapsible>
	);

	//
}
