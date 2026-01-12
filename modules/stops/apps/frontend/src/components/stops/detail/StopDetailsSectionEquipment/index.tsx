'use client';

/* * */

import { StopDetailFacilityCheckbox } from '@/components/stops/detail/StopDetailFacilityCheckbox';
import { Translations } from '@/lib/translations';
import { StopFacilitySchema } from '@tmlmobilidade/types';
import { Collapsible, Grid, Section } from '@tmlmobilidade/ui';
import { useTranslation } from 'react-i18next';

/* * */

export function StopDetailsSectionEquipment() {
	const { t } = useTranslation();

	return (
		<Collapsible
			description={t('stops:stops.detail.SectionEquipment.description')}
			title={t('stops:stops.detail.SectionEquipment.title')}
		>
			<Section>
				<Grid columns="abcd" gap="md">
					{StopFacilitySchema.options.map(value => (
						<StopDetailFacilityCheckbox
							key={value}
							label={t(`${Translations.FACILITIES}.${value}`)}
							value={value}
							proposeable
						/>
					))}
				</Grid>
			</Section>
		</Collapsible>
	);
}
