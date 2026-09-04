'use client';

import { useStopDetailContext } from '@/components/stops/detail/StopDetail.context';
import { Translations } from '@/lib/translations';
import { AvailabilityStatusValues } from '@tmlmobilidade/go-types-shared';
import { Collapsible, Grid, Section, Select, Spacer, TextInput } from '@tmlmobilidade/ui';

/* * */

export function StopDetailsSectionShelter() {
	//

	//
	// A. Setup variables

	const stopDetailContext = useStopDetailContext();

	//
	// B. Transform data

	const availabilityStatusOptions = AvailabilityStatusValues.map(value => ({
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
					<Select
						key={stopDetailContext.data.form.key('has_shelter')}
						data={availabilityStatusOptions}
						readOnly={stopDetailContext.flags.isReadOnly}
						{...stopDetailContext.data.form.getInputProps('has_shelter')}
					/>
					<TextInput
						key={stopDetailContext.data.form.key('shelter_code')}
						label="Código do Abrigo"
						readOnly={stopDetailContext.flags.isReadOnly}
						{...stopDetailContext.data.form.getInputProps('shelter_code')}
					/>
					<TextInput
						key={stopDetailContext.data.form.key('shelter_maintainer')}
						label="Entidade Gestora do Abrigo"
						readOnly={stopDetailContext.flags.isReadOnly}
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
					readOnly={stopDetailContext.flags.isReadOnly}
					{...stopDetailContext.data.form.getInputProps('last_shelter_installation')}
				/>
			</Section>
		</Collapsible>
	);

	//
}
