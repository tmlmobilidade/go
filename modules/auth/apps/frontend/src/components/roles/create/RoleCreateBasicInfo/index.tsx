'use client';

/* * */

import { useRoleCreateContext } from '@/components/roles/create/RoleCreate.context';
import { Grid, Section, TextInput } from '@tmlmobilidade/ui';

/* * */

export function RoleCreateBasicInfo() {
	//

	//
	// A. Setup variables

	const roleCreateContext = useRoleCreateContext();

	//
	// B. Render components

	return (
		<Section gap="md">
			<Grid columns="a" gap="xl">
				<TextInput
					key={roleCreateContext.data.form.key('name')}
					label="Nome do grupo"
					maxLength={255}
					data-autofocus
					withAsterisk
					{...roleCreateContext.data.form.getInputProps('name')}
				/>
			</Grid>
		</Section>
	);

	//
}
