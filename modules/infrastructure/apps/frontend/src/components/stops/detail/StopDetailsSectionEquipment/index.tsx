'use client';

import { StopDetailFacilityCheckbox } from '@/components/stops/detail/StopDetailFacilityCheckbox';
import { Translations } from '@/lib/translations';
import { StopFacilityValues } from '@tmlmobilidade/go-types-infrastructure';
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
					{StopFacilityValues.map(value => (
						<StopDetailFacilityCheckbox
							key={value}
							label={Translations.FACILITIES[value]}
							value={value}
						/>
					))}
				</Grid>
			</Section>
		</Collapsible>
	);
}
