'use client';

/* * */

import { useAgencyDetailContext } from '@/components/agencies/detail/AgencyDetail.context';
import { Collapsible, Divider, Grid, NumberInput, Section, Text, TextInput } from '@tmlmobilidade/ui';

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
						readOnly={agencyDetailContext.flags.isReadOnly}
						step={0.01}
						{...agencyDetailContext.data.form.getInputProps('financials.price_per_km')}
					/>
					<TextInput
						defaultValue={totalVkmsPerYear.toLocaleString('pt-PT', { maximumFractionDigits: 0, minimumFractionDigits: 0 })}
						label="Total de km por ano"
						placeholder="1000000"
						readOnly
					/>
				</Grid>

				<Divider />

				<Text weight="bold">Total de kms em</Text>

				<Grid columns="ab" gap="lg">
					{months.map((month, index) => (
						<TextInput
							key={agencyDetailContext.data.form.key(`financials.vkm_per_month.${index}`)}
							label={month}
							placeholder="100000"
							readOnly={agencyDetailContext.flags.isReadOnly}
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
