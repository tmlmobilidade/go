'use client';

/* * */

import { useRoleDetailContext } from '@/contexts/RoleDetail.context';
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
						key={roleDetailContext.data.form.key('name')}
						label="Nome do grupo"
						maxLength={255}
						withAsterisk
						{...roleDetailContext.data.form.getInputProps('name')}
					/>
				</Grid>
			</Section>
		</Collapsible>
	);

	//
}
