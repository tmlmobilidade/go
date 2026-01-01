'use client';

/* * */

import { useAlertDetailContext } from '@/components/detail/AlertDetail.context';
import { ReferencesGroup } from '@/components/common/references/ReferencesGroup';
import { Collapsible, Grid, MultiSelect, Section, Select, useAgenciesContext, useLocationsContext } from '@tmlmobilidade/ui';
import { useMemo } from 'react';

/* * */

export function AlertDetailSectionReferences() {
	//

	//
	// A. Setup variables

	const agenciesContext = useAgenciesContext();
	const locationsContext = useLocationsContext();
	const alertDetailContext = useAlertDetailContext();

	//
	// B. Transform data

	const municipalitiesOptions = useMemo(() => {
		if (!locationsContext.data.municipalities) return [];
		return locationsContext.data.municipalities.map(item => ({ label: item.name, value: item.id }));
	}, [locationsContext.data.municipalities]);

	//
	// C. Render components

	return (
		<Collapsible
			description="As referências (Linhas, Paragens, Municípios, Etc...) afetadas deste alerta."
			title="Referências"
			defaultOpen
		>
			<Section>
				<Grid gap="md">
					<Select
						key={alertDetailContext.data.form.key('agency_id')}
						data={agenciesContext.data.as_options}
						description="Selecione o operador que será afetado pelo alerta"
						label="Operador afetado"
						{...alertDetailContext.data.form.getInputProps('agency_id')}
					/>
					<MultiSelect
						key={alertDetailContext.data.form.key('municipality_ids')}
						data={municipalitiesOptions}
						description="Selecione os municípios que serão afetados pelo alerta"
						label="Municípios Afetados"
						{...alertDetailContext.data.form.getInputProps('municipality_ids')}
					/>
					<ReferencesGroup
						municipalityIds={alertDetailContext.data.form.getValues().municipality_ids}
						onSetFieldValue={alertDetailContext.data.form.setFieldValue}
						references={alertDetailContext.data.form.getValues().references}
						referenceType={alertDetailContext.data.form.getValues().reference_type}
					/>
				</Grid>
			</Section>
		</Collapsible>
	);
}
