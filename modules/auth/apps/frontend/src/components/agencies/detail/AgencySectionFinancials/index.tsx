'use client';

import { useAgencyDetailContext } from '@/components/agencies/detail/AgencyDetail.context';
import { Collapsible, ContextFormController, Divider, Grid, NumberInput, Section, Text, TextInput, useContextFormWatch } from '@tmlmobilidade/ui';
import { useTranslation } from 'react-i18next';

/* * */

export function AgencySectionFinancials() {
	//

	//
	// A. Setup variables

	const { t } = useTranslation();
	const agencyDetailContext = useAgencyDetailContext();

	const months = [
		'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
		'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro',
	];

	//
	// B. Transform data

	const vkmPerMonthValue = useContextFormWatch({ control: agencyDetailContext.form.instance.control, name: 'financials.vkm_per_month' }) || [];

	const totalVkmsPerYear = vkmPerMonthValue?.reduce((acc, curr) => acc + Number(curr || 0), 0) || 0;

	//
	// C. Render components

	return (
		<Collapsible
			description={t('default:agencies.detail.SectionFinancials.description')}
			title={t('default:agencies.detail.SectionFinancials.title')}
		>
			<Section gap="lg">
				<Grid columns="ab" gap="lg">
					<ContextFormController
						control={agencyDetailContext.form.instance.control}
						name="financials.price_per_km"
						render={({ field, fieldState }) => (
							<NumberInput
								error={fieldState.error?.message}
								label={t('default:agencies.detail.SectionFinancials.fields.price_per_km.label')}
								onChange={field.onChange}
								placeholder={t('default:agencies.detail.SectionFinancials.fields.price_per_km.placeholder')}
								readOnly={agencyDetailContext.flags.isReadOnly}
								step={0.01}
								value={field.value}
							/>
						)}
					/>
					<TextInput
						defaultValue={totalVkmsPerYear.toLocaleString('pt-PT', { maximumFractionDigits: 0, minimumFractionDigits: 0 })}
						label={t('default:agencies.detail.SectionFinancials.fields.total_vkm_per_year.label')}
						placeholder={t('default:agencies.detail.SectionFinancials.fields.total_vkm_per_year.placeholder')}
						readOnly
					/>
				</Grid>

				<Divider />

				<Text weight="bold">Total de kms em</Text>

				<Grid columns="ab" gap="lg">
					{months.map((month, index) => (
						<ContextFormController
							key={month}
							control={agencyDetailContext.form.instance.control}
							name={`financials.vkm_per_month.${index}`}
							render={({ field, fieldState }) => (
								<NumberInput
									error={fieldState.error?.message}
									label={month}
									onChange={field.onChange}
									placeholder="100000"
									readOnly={agencyDetailContext.flags.isReadOnly}
									step={1}
									value={field.value}
								/>
							)}
						/>
					))}
				</Grid>
			</Section>
		</Collapsible>
	);

	//
}
