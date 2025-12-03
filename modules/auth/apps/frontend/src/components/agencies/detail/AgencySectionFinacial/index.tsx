'use client';

/* * */

import { useAgencyDetailContext } from '@/contexts/AgencyDetail.context';
import { Collapsible, Grid, NumberInput, Section } from '@tmlmobilidade/ui';

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
					<NumberInput
						key={agencyDetailContext.data.form.key('financials.price_per_km')}
						label="Preço por km"
						placeholder="1.50"
						step={0.01}
						{...agencyDetailContext.data.form.getInputProps('financials.price_per_km')}
					/>
					<NumberInput
						key={agencyDetailContext.data.form.key('financials.total_vkm_per_year')}
						label="Total de km por ano"
						placeholder="1000000"
						{...agencyDetailContext.data.form.getInputProps('financials.total_vkm_per_year')}
					/>
				</Grid>
			</Section>
		</Collapsible>
	);

	//
}
