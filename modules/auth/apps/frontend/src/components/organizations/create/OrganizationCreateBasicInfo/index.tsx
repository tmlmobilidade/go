'use client';

/* * */

import { useOrganizationCreateContext } from '@/components/organizations/create/OrganizationCreate.context';
import { CreateOrganizationSchema } from '@tmlmobilidade/types';
import { Grid, Section, TextInput } from '@tmlmobilidade/ui';

/* * */

export function OrganizationCreateBasicInfo() {
	//

	//
	// A. Setup variables

	const organizationCreateContext = useOrganizationCreateContext();

	//
	// B. Render components

	return (
		<Section gap="lg">
			<Grid columns="aab" gap="lg">
				<TextInput
					key={organizationCreateContext.data.form.key('long_name')}
					label="Nome da organização"
					maxLength={255}
					placeholder="Carris Metropolitana"
					withAsterisk={!CreateOrganizationSchema.shape.long_name}
					{...organizationCreateContext.data.form.getInputProps('long_name')}
				/>
				<TextInput
					key={organizationCreateContext.data.form.key('short_name')}
					label="Sigla"
					maxLength={10}
					placeholder="CM"
					withAsterisk={!CreateOrganizationSchema.shape.short_name}
					{...organizationCreateContext.data.form.getInputProps('short_name')}
				/>
			</Grid>
		</Section>
	);

	//
}
