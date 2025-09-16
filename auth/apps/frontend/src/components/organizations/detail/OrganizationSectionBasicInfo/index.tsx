'use client';

import { UploadImage } from '@/components/common/UploadImage';
import { useOrganizationsDetailContext } from '@/contexts/OrganizationDetail.context';
import { useQuickLinksContext } from '@/contexts/QuickLinks';
/* * */

import { CreateOrganizationSchema } from '@tmlmobilidade/types';
import { Collapsible, Combobox, Grid, Section, TextInput } from '@tmlmobilidade/ui';

/* * */

export function OrganizationDetailBasicInfo() {
	//

	//
	// A. Setup variables

	const organizationDetailContext = useOrganizationsDetailContext();
	const { data: quickLinks } = useQuickLinksContext();

	//
	// B. Transform data

	const organizationItems = quickLinks.raw.map(organization => ({
		label: organization.title,
		value: organization._id,
	}));

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
				<Grid columns="ab" gap="lg">
					<UploadImage
						label="Selecionar logótipo"
						maxFileSize={50 * 1024 * 1024} // 50 MB
						onFileChange={organizationDetailContext.actions.setValidationFile}
					/>
					<Combobox
						data={organizationItems}
						label="Links rápidos"
						value={organizationDetailContext.data.form.values.home_links}
						fullWidth
						multiple
						{...organizationDetailContext.data.form.getInputProps('home_links', { multiple: true })}
					/>
				</Grid>
			</Section>
		</Collapsible>
	);

	//
}
