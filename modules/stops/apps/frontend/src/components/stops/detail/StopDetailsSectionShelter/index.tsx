'use client';

/* * */

import { useStopDetailContext } from '@/contexts/StopDetails.context';
import { Translations } from '@/lib/translations';
import { ScopeOption } from '@/types/proposed-changes';
import { hasAnySchema } from '@tmlmobilidade/types';
import { Collapsible, Grid, ProposedChangesWrapper, Section, Select, Spacer, TextInput } from '@tmlmobilidade/ui';

/* * */

export function StopDetailsSectionShelter() {
	//

	//
	// A. Setup variables

	const stopDetailContext = useStopDetailContext();
	const scopeOption: ScopeOption = 'stop';

	//
	// B. Transform data

	const hasShelterOptions = hasAnySchema.options.map (value => ({
		label: Translations.HAS_ANY[value],
		value: value,
	}));

	//
	// C. Render components

	return (
		<Collapsible
			description="Informações relacionadas com o abrigo."
			title="Abrigo"
		>
			<Section>
				<Grid columns="abc" gap="md">

					<ProposedChangesWrapper
						inputName="has_shelter"
						label="Existe Abrigo?"
						relatedId={stopDetailContext.data.stop?._id}
						scope={scopeOption}
					>
						<Select
							data={hasShelterOptions}
							placeholder="Selecione uma opção..."
							{...stopDetailContext.data.form.getInputProps('has_shelter')}
						/>
					</ProposedChangesWrapper>
					<TextInput
						label="Código do Abrigo"
						miw="100%"
						placeholder="..."
						{...stopDetailContext.data.form.getInputProps('shelter_code')}
					/>
					<TextInput
						label="Entidade Gestora do Abrigo"
						miw="100%"
						placeholder="..."
						{...stopDetailContext.data.form.getInputProps('shelter_maintainer')}
					/>
				</Grid>
				<Spacer />
			</Section>
			<Section>
				<TextInput
					label="Data de Instalação do abrigo"
					miw="100%"
					placeholder="2023-02-10"
					{...stopDetailContext.data.form.getInputProps('last_shelter_installation')}
				/>
			</Section>
		</Collapsible>
	);

	//
}
