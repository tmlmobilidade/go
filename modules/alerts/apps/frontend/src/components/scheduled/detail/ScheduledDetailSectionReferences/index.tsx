'use client';

/* * */

import { ReferencesGroup } from '@/components/common/references/ReferencesGroup';
import { useScheduledDetailContext } from '@/components/scheduled/detail/ScheduledDetail.context';
import { useLocationsContext } from '@/contexts/Locations.context';
import { Collapsible, MultiSelect, Section } from '@tmlmobilidade/ui';
import { useMemo } from 'react';

/* * */

export function ScheduledDetailSectionReferences() {
	//
	//
	// A. Setup variables

	const locationsContext = useLocationsContext();
	const alertDetailContext = useScheduledDetailContext();

	//
	// B. Transform data

	const references = useMemo(() => alertDetailContext.data.form.values.references, [
		alertDetailContext.data.form.values.references,
	]);

	const municipalitiesOptions = useMemo(() => {
		if (!locationsContext.data.municipalities) return [];

		return locationsContext.data.municipalities.map(municipality => ({
			label: municipality.name,
			value: municipality.id,
		}));
	}, [locationsContext.data.municipalities]);

	//
	// C. Render components

	return (
		<Collapsible
			description="As referências (Linhas, Paragens, Municípios, Etc...) afetadas deste alerta."
			title="Referências"
		>
			<Section gap="md">
				<MultiSelect
					key={alertDetailContext.data.form.key('municipality_ids')}
					data={municipalitiesOptions}
					description="Selecione os municípios que serão afetados pelo alerta"
					label="Municípios Afetados"
					onChange={ids => alertDetailContext.data.form.setFieldValue('municipality_ids', ids)}
					value={alertDetailContext.data.form.values.municipality_ids}
				/>

				<ReferencesGroup
					keys={alertDetailContext.data.form.values.reference_type}
					municipality_ids={alertDetailContext.data.form.values.municipality_ids}
					onSetFieldValue={alertDetailContext.data.form.setFieldValue}
					reference_type={alertDetailContext.data.form.values.reference_type}
					references={references}
				/>
			</Section>
		</Collapsible>
	);
}
