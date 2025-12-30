'use client';

/* * */

import { StopDetailFacilityCheckbox } from '@/components/stops/detail/StopDetailFacilityCheckbox';
import { Translations } from '@/lib/translations';
import { StopFacilitySchema } from '@tmlmobilidade/types';
import { Collapsible, Grid, Section } from '@tmlmobilidade/ui';
import { useTranslation } from 'react-i18next';

/* * */

export function StopDetailsSectionEquipment() {
	const { t } = useTranslation('stops', { keyPrefix: 'detail.sections.equipment' });
	const { t: tTypes } = useTranslation('stops', { keyPrefix: Translations.FACILITIES });

	return (
		<Collapsible
			description={t('description')}
			title={t('title')}
		>
			<Section>
				<Grid columns="abcd" gap="md">
					{StopFacilitySchema.options.map(value => (
						<StopDetailFacilityCheckbox
							key={value}
							label={tTypes(value)}
							value={value}
							proposeable
						/>
					))}
				</Grid>
			</Section>
		</Collapsible>
	);
}
