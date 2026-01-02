'use client';

/* * */

import { ReferencesEditor } from '@/components/common/references/ReferencesEditor';
import { useAlertDetailContext } from '@/components/detail/AlertDetail.context';
import { type Alert } from '@tmlmobilidade/types';
import { Collapsible, Grid, Section, Select, useAgenciesContext } from '@tmlmobilidade/ui';

/* * */

export function AlertDetailSectionReferences() {
	//

	//
	// A. Setup variables

	const agenciesContext = useAgenciesContext();
	const alertDetailContext = useAlertDetailContext();

	//
	// B. Handle actions

	const handleChangeReferenceType = (value: Alert['reference_type']) => {
		alertDetailContext.data.form.setFieldValue('reference_type', value);
	};

	const handleChangeReferences = (references: Alert['references']) => {
		alertDetailContext.data.form.setFieldValue('references', references);
	};

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
				</Grid>
			</Section>
			<ReferencesEditor
				onChangeReferences={handleChangeReferences}
				onChangeReferenceType={handleChangeReferenceType}
				selectedAgencyId={alertDetailContext.data.form.getValues().agency_id}
				selectedMunicipalityIds={alertDetailContext.data.form.getValues().municipality_ids}
				selectedReferences={alertDetailContext.data.form.getValues().references}
				selectedReferenceType={alertDetailContext.data.form.getValues().reference_type}
				withBorder
			/>
		</Collapsible>
	);
}
