'use client';

/* * */

import { ReferencesEditor } from '@/components/common/references/ReferencesEditor';
import { useAlertDetailContext } from '@/components/detail/AlertDetail.context';
import { Alert } from '@tmlmobilidade/types';
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
	// C. Handle actions

	const handleChangeReferenceType = (value: Alert['reference_type']) => {
		alertDetailContext.data.form.setFieldValue('reference_type', value);
	};

	const handleChangeReferences = (references: Alert['references']) => {
		alertDetailContext.data.form.setFieldValue('references', references);
	};

	//
	// D. Render components

	return (
		<Collapsible
			description="As referências (Linhas, Paragens, Municípios, Etc...) afetadas deste alerta."
			title="Referências"
			defaultOpen
		>
			<Section>
				<Grid gap="md">
					{/* <MultiSelect
						key={alertDetailContext.data.form.key('municipality_ids')}
						data={municipalitiesOptions}
						description="Selecione os municípios que serão afetados pelo alerta"
						label="Municípios Afetados"
						{...alertDetailContext.data.form.getInputProps('municipality_ids')}
						/> */}
					<Select
						key={alertDetailContext.data.form.key('agency_id')}
						data={agenciesContext.data.as_options}
						description="Selecione o operador que será afetado pelo alerta"
						label="Operador afetado"
						{...alertDetailContext.data.form.getInputProps('agency_id')}
					/>
					<ReferencesEditor
						onChangeReferences={handleChangeReferences}
						onChangeReferenceType={handleChangeReferenceType}
						selectedAgencyId={alertDetailContext.data.form.getValues().agency_id}
						selectedMunicipalityIds={alertDetailContext.data.form.getValues().municipality_ids}
						selectedReferences={alertDetailContext.data.form.getValues().references}
						selectedReferenceType={alertDetailContext.data.form.getValues().reference_type}
					/>
				</Grid>
			</Section>
		</Collapsible>
	);
}
