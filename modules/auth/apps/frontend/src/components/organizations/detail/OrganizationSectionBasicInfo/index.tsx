'use client';

/* * */

import { UploadImage } from '@/components/common/UploadImage';
import { useOrganizationsDetailContext } from '@/components/organizations/detail/OrganizationDetail.context';
import { CreateOrganizationSchema } from '@tmlmobilidade/types';
import { Collapsible, Grid, Section, TextInput } from '@tmlmobilidade/ui';

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
						key={organizationDetailContext.data.form.key('long_name')}
						label="Nome da organização"
						maxLength={255}
						placeholder="Carris Metropolitana"
						readOnly={organizationDetailContext.flags.isReadOnly}
						withAsterisk={!CreateOrganizationSchema.shape.long_name}
						{...organizationDetailContext.data.form.getInputProps('long_name')}
					/>
					<TextInput
						key={organizationDetailContext.data.form.key('short_name')}
						label="Sigla"
						maxLength={10}
						placeholder="CM"
						readOnly={organizationDetailContext.flags.isReadOnly}
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
