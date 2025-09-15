'use client';

import { useOrganizationsDetailContext } from '@/contexts/OrganizationDetail.context';
/* * */

import { CreateOrganizationSchema } from '@tmlmobilidade/types';
import { Collapsible, FileUpload, Grid, Section, TextInput } from '@tmlmobilidade/ui';

/* * */

export function OrganizationDetailBasicInfo() {
	//

	//
	// A. Setup variables

	const organizationDetailContext = useOrganizationsDetailContext();

	//
	// B. Render components

	return (
		<Collapsible
			description="Detalhes como nome, sigla, logótipo, links da página inicial."
			title="Informações gerais"
		>
			<Section gap="lg">
				<Grid columns="aab" gap="lg">
					<TextInput
						label="Nome da organização"
						maxLength={255}
						placeholder="Carris Metropolitana"
						withAsterisk={!CreateOrganizationSchema.shape.long_name}
						{...organizationDetailContext.data.form.getInputProps('long_name')}
					/>
					<TextInput
						label="Sigla"
						maxLength={10}
						placeholder="CM"
						withAsterisk={!CreateOrganizationSchema.shape.short_name}
						{...organizationDetailContext.data.form.getInputProps('short_name')}
					/>
				</Grid>
				<Grid columns="abc" gap="lg">
					<FileUpload
						accept="image/png, image/jpeg"
						label="Selecionar logótipo"
						maxFileSize={5 * 1024 * 1024} // 5 MB
						onFileChange={organizationDetailContext.actions.setValidationFile}	
					/>
				</Grid>
			</Section>
		</Collapsible>
	);

	//
}
