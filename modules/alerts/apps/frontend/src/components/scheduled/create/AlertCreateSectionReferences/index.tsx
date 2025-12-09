'use client';

/* * */

import { ReferencesGroup } from '@/components/common/references/ReferencesGroup';
import { useAlertCreateContext } from '@/contexts/AlertCreate.context';
import { useLocationsContext } from '@/contexts/Locations.context';
import { Collapsible, MultiSelect, Section } from '@tmlmobilidade/ui';
import { useMemo } from 'react';

/* * */

export function AlertCreateSectionReferences() {
	//
	//
	// A. Setup variables

	const locationsContext = useLocationsContext();
	const alertCreateContext = useAlertCreateContext();
	//
	// B. Transform data

	const references = useMemo(() => alertCreateContext.data.form.values.references, [
		alertCreateContext.data.form.values.references,
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
					data={municipalitiesOptions}
					description="Selecione os municípios que serão afetados pelo alerta"
					label="Municípios Afetados"
					onChange={ids => alertCreateContext.data.form.setFieldValue('municipality_ids', ids)}
					value={alertCreateContext.data.form.values.municipality_ids}
				/>

				<ReferencesGroup
					municipality_ids={alertCreateContext.data.form.values.municipality_ids}
					onSetFieldValue={alertCreateContext.data.form.setFieldValue}
					reference_type={alertCreateContext.data.form.values.reference_type}
					references={references}
				/>
			</Section>
		</Collapsible>
	);
}
