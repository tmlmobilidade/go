'use client';

/* * */

import { useAgencyDetailContext } from '@/contexts/AgencyDetail.context';
import { Collapsible, Grid, NumberInput, Section } from '@tmlmobilidade/ui';
import { useTranslation } from 'react-i18next';

/* * */

export function AgencySectionFinacial() {
	//

	//
	// A. Setup variables

	const agencyDetailContext = useAgencyDetailContext();
	const { t } = useTranslation('auth', { keyPrefix: 'agencies.detail.Financial' });

	//
	// B. Render components

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
						step={0.01}
						{...agencyDetailContext.data.form.getInputProps('financials.price_per_km')}
					/>
					<NumberInput
						key={agencyDetailContext.data.form.key('financials.total_vkm_per_year')}
						label={t('fields.total_vkm_per_year')}
						placeholder={t('fields.total_vkm_per_year_placeholder')}
						{...agencyDetailContext.data.form.getInputProps('financials.total_vkm_per_year')}
					/>
				</Grid>
			</Section>
		</Collapsible>
	);

	//
}
