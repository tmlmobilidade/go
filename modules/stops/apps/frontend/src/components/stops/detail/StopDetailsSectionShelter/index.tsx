'use client';

/* * */

import { useStopDetailContext } from '@/contexts/StopDetails.context';
import { Translations } from '@/lib/translations';
import { ScopeOption } from '@/types/proposed-changes';
import { AvailabilityStatusSchema } from '@tmlmobilidade/types';
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

	const availabilityStatusOptions = AvailabilityStatusSchema.options.map(value => ({
		label: Translations.AVAILABILITY_STATUS[value],
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
							key={stopDetailContext.data.form.key('has_shelter')}
							data={availabilityStatusOptions}
							{...stopDetailContext.data.form.getInputProps('has_shelter')}
						/>
					</ProposedChangesWrapper>
					<TextInput
						key={stopDetailContext.data.form.key('shelter_code')}
						label="Código do Abrigo"
						{...stopDetailContext.data.form.getInputProps('shelter_code')}
					/>
					<TextInput
						key={stopDetailContext.data.form.key('shelter_maintainer')}
						label="Entidade Gestora do Abrigo"
						{...stopDetailContext.data.form.getInputProps('shelter_maintainer')}
					/>
				</Grid>
				<Spacer />
			</Section>
			<Section>
				<TextInput
					key={stopDetailContext.data.form.key('shelter_material')}
					label="Data de Instalação do abrigo"
					placeholder="2023-02-10"
					{...stopDetailContext.data.form.getInputProps('last_shelter_installation')}
				/>
			</Section>
		</Collapsible>
	);

	//
}
