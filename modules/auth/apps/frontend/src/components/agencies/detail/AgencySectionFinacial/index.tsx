'use client';

/* * */

import { useAgencyDetailContext } from '@/contexts/AgencyDetail.context';
import { CreateAgencySchema } from '@go/types';
import { Collapsible, Grid, Section, TextInput } from '@go/ui';

/* * */

export function AgencySectionFinacial() {
	//

	//
	// A. Setup variables

	const agencyDetailContext = useAgencyDetailContext();

	//
	// B. Render components

	return (
		<Collapsible
			description="Informação financeira da agência"
			title="Informação Financeira"
		>
			<Section gap="lg">
				<Grid columns="ab" gap="lg">
					<TextInput
						label="Preço por km"
						placeholder="1.50"
						step="0.01"
						type="number"
						withAsterisk={!CreateAgencySchema.shape.financials.shape.price_per_km.isOptional()}
						{...agencyDetailContext.data.form.getInputProps('financials.price_per_km')}
					/>
					<TextInput
						label="Total de km por ano"
						placeholder="1000000"
						type="number"
						withAsterisk={!CreateAgencySchema.shape.financials.shape.total_vkm_per_year.isOptional()}
						{...agencyDetailContext.data.form.getInputProps('financials.total_vkm_per_year')}
					/>
				</Grid>
			</Section>
		</Collapsible>
	);

	//
}
