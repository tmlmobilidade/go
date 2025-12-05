'use client';

import { useRoleCreateContext } from '@/contexts/RoleCreate.context';
/* * */

import { Collapsible, Grid, Section, TextInput } from '@tmlmobilidade/ui';

/* * */

export function RoleCreateBasicInfo() {
	//

	//
	// A. Setup variables

	const roleCreateContext = useRoleCreateContext();

	//
	// B. Render components

	return (
		<Collapsible
			description="Informação básica do grupo de permissões."
			title="Informação Básica"
		>
			<Section gap="md">
				<Grid columns="ab" gap="xl">
					<TextInput
						key={roleCreateContext.data.form.key('name')}
						label="Nome do grupo"
						maxLength={255}
						placeholder="..."
						withAsterisk
						{...roleCreateContext.data.form.getInputProps('name')}
					/>
				</Grid>
			</Section>
		</Collapsible>
	);

	//
}
