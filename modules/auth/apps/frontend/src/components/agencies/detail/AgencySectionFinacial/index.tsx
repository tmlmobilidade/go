'use client';

/* * */

import { useAgencyDetailContext } from '@/components/agencies/detail/AgencyDetail.context';
import { Collapsible, Divider, Grid, NumberInput, Section, Text, TextInput } from '@tmlmobilidade/ui';
import { useTranslation } from 'react-i18next';

/* * */

export function AgencySectionFinacial() {
	//

	//
	// A. Setup variables

	const agencyDetailContext = useAgencyDetailContext();
	const { t } = useTranslation('auth', { keyPrefix: 'agencies.detail.Financial' });

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
			description={t('description')}
			title={t('title')}
		>
			<Section gap="lg">
				<Grid columns="ab" gap="lg">
					<NumberInput
						key={agencyDetailContext.data.form.key('financials.price_per_km')}
						label={t('fields.price_per_km')}
						placeholder={t('fields.price_per_km_placeholder')}
						readOnly={agencyDetailContext.flags.isReadOnly}
						step={0.01}
						{...agencyDetailContext.data.form.getInputProps('financials.price_per_km')}
					/>
					<TextInput
						defaultValue={totalVkmsPerYear.toLocaleString('pt-PT', { maximumFractionDigits: 0, minimumFractionDigits: 0 })}
						label={t('fields.total_vkm_per_year')}
						placeholder={t('fields.total_vkm_per_year_placeholder')}
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
