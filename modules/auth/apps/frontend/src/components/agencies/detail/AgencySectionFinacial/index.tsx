'use client';

/* * */

import { useAgencyDetailContext } from '@/contexts/AgencyDetail.context';
import { CreateAgencySchema } from '@tmlmobilidade/types';
import { Collapsible, Divider, Grid, Section, Text, TextInput } from '@tmlmobilidade/ui';

/* * */

export function AgencySectionFinacial() {
	//

	//
	// A. Setup variables

	const agencyDetailContext = useAgencyDetailContext();

	const months = [
		'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
		'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro',
	];

	//
	// B. Transform data

	const totalVkmsPerYear = agencyDetailContext.data.form.values.financials?.vkm_per_month?.reduce((acc, curr) => acc + Number(curr || 0), 0) || 0;

	//
	// C. Render components

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

					<TextInput
						label="Total de km por ano"
						placeholder="1000000"
						type="string"
						value={totalVkmsPerYear.toLocaleString('pt-PT', { maximumFractionDigits: 0, minimumFractionDigits: 0 })}
						disabled
					/>
				</Grid>

				<Divider />

				<Text weight="bold">Total de kms em</Text>
				<Grid columns="ab" gap="lg">
					{months.map((month, index) => (
						<TextInput
							key={month}
							label={month}
							placeholder="100000"
							type="number"
							{...agencyDetailContext.data.form.getInputProps(`financials.vkm_per_month.${index}`)}
						/>
					))}
				</Grid>
			</Section>
		</Collapsible>
	);

	//
}
