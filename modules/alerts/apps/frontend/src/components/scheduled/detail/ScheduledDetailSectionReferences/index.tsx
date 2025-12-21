'use client';

/* * */

import { ReferencesGroup } from '@/components/common/references/ReferencesGroup';
import { useScheduledDetailContext } from '@/components/scheduled/detail/ScheduledDetail.context';
import { Collapsible, Grid, MultiSelect, Section, useAgenciesContext, useLocationsContext } from '@tmlmobilidade/ui';
import { useMemo } from 'react';

/* * */

export function ScheduledDetailSectionReferences() {
	//

	//
	// A. Setup variables

	const agenciesContext = useAgenciesContext();
	const locationsContext = useLocationsContext();
	const scheduledDetailContext = useScheduledDetailContext();

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
					<MultiSelect
						key={scheduledDetailContext.data.form.key('agency_ids')}
						data={agenciesContext.data.as_options}
						description="Selecione os municípios que serão afetados pelo alerta"
						label="Operadores afetados"
						{...scheduledDetailContext.data.form.getInputProps('agency_ids')}
					/>
					<MultiSelect
						key={scheduledDetailContext.data.form.key('municipality_ids')}
						data={municipalitiesOptions}
						description="Selecione os municípios que serão afetados pelo alerta"
						label="Municípios Afetados"
						{...scheduledDetailContext.data.form.getInputProps('municipality_ids')}
					/>
					<ReferencesGroup
						municipalityIds={scheduledDetailContext.data.form.getValues().municipality_ids}
						onSetFieldValue={scheduledDetailContext.data.form.setFieldValue}
						references={scheduledDetailContext.data.form.getValues().references}
						referenceType={scheduledDetailContext.data.form.getValues().reference_type}
					/>
				</Grid>
			</Section>
		</Collapsible>
	);
}
