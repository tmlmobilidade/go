'use client';

/* * */

import { UploadImage } from '@/components/common/UploadImage';
import { useOrganizationsDetailContext } from '@/contexts/OrganizationDetail.context';
import { CreateOrganizationSchema } from '@go/types';
import { Collapsible, Grid, Section, TextInput } from '@go/ui';

/* * */

export function OrganizationDetailBasicInfo() {
	//

	//
	// A. Setup variables

	const organizationDetailContext = useOrganizationsDetailContext();

	//
	// C. Render components

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
				<Section>
					<Grid columns="ab" gap="lg">
						<UploadImage
							imageUrl={organizationDetailContext.data.logoDarkUrl}
							label="Logótipo em Modo Escuro"
							onDelete={() => organizationDetailContext.actions.deleteImage('dark')}
							onFileChange={organizationDetailContext.actions.fileChangedDark}
						/>
						<UploadImage
							imageUrl={organizationDetailContext.data.logoLightUrl}
							label="Logótipo em Modo Claro"
							onDelete={() => organizationDetailContext.actions.deleteImage('light')}
							onFileChange={organizationDetailContext.actions.fileChangedLight}
						/>
					</Grid>
				</Section>
			</Section>
		</Collapsible>
	);

	//
}
