'use client';

import { StopDetailFacilityCheckbox } from '@/components/stops/detail/StopDetailFacilityCheckbox';
import { Translations } from '@/lib/translations';
import { StopFacilitySchema } from '@tmlmobilidade/types';
import { Collapsible, Grid, Section } from '@tmlmobilidade/ui';

/* * */

export function StopDetailsSectionEquipment() {
	return (
		<Collapsible
			description="Quais são os equipamentos que esta paragem serve."
			title="Equipamentos Servidos"
		>
			<Section>
				<Grid columns="abcd" gap="md">
					{StopFacilitySchema.options.map(value => (
						<StopDetailFacilityCheckbox
							key={value}
							label={Translations.FACILITIES[value]}
							value={value}
							proposeable
						/>
					))}
				</Grid>
			</Section>
		</Collapsible>
	);
}
