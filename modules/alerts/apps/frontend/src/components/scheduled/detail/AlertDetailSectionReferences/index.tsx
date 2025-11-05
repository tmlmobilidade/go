'use client';

/* * */

import { AlertReferencesAgencies } from '@/components/scheduled/detail/AlertReferencesAgencies';
import { AlertReferencesLines } from '@/components/scheduled/detail/AlertReferencesRoutes';
import { AlertReferencesStops } from '@/components/scheduled/detail/AlertReferencesStops';
import { useAlertDetailContext } from '@/contexts/AlertDetail.context';
import { useLocationsContext } from '@/contexts/Locations.context';
import { Alert, referenceTypeSchema } from '@go/types';
import { Collapsible, MultiSelect, openConfirmModal, Section, SegmentedControl } from '@go/ui';
import { useMemo } from 'react';

/* * */

export function AlertDetailSectionReferences() {
	//

	//
	// A. Setup variables

	const locationsContext = useLocationsContext();
	const alertDetailContext = useAlertDetailContext();

	//
	// B. Transform data

	const municipalitiesOptions = useMemo(() => {
		if (!locationsContext.data.municipalities) return [];

		return locationsContext.data.municipalities.map(municipality => ({
			label: municipality.name,
			value: municipality.id,
		}));
	}, [locationsContext.data.municipalities]);

	const references = useMemo(() => alertDetailContext.data.form.values.references, [
		alertDetailContext.data.form.values.references,
	]);

	//
	// C. Handle actions

	const parseOptionsLabel = (value: Alert['reference_type']) => {
		switch (value) {
			case 'AGENCY':
				return { label: 'Agências', value };
			case 'LINE':
				return { label: 'Linhas', value };
			case 'STOP':
				return { label: 'Paragens', value };
			case 'TRIP':
				return { label: 'Viagens', value };
		}
	};

	const handleSegmentedControlChange = (value: Alert['reference_type']) => {
		if (references.length > 0) {
			openConfirmModal({
				centered: true,
				children: (
					<>
						<div>Você está prestes a perder as referências que já foram adicionadas.</div>
					</>
				),
				closeOnClickOutside: true,
				labels: { cancel: 'Cancelar', confirm: 'Continuar' },
				onConfirm: () => {
					alertDetailContext.data.form.setFieldValue('reference_type', value);
					alertDetailContext.data.form.setFieldValue('references', []);
				},
				title: 'Tem certeza que deseja mudar a referência?',
			});
		}
		else {
			alertDetailContext.data.form.setFieldValue('reference_type', value);
		}
	};

	//
	// D. Render components

	return (
		<Collapsible
			description="As referências (Linhas, Paragens, Municípios, Etc...) afetadas deste alerta."
			title="Referências"
		>
			<Section gap="md">

				<MultiSelect
					key={alertDetailContext.data.form.key('municipality_ids')}
					data={municipalitiesOptions}
					description="Selecione os munícios que serão afetados pelo alerta"
					label="Municípios Afetados"
					selected={alertDetailContext.data.form.values.municipality_ids}
					{...alertDetailContext.data.form.getInputProps('municipality_ids')}
				/>

				<SegmentedControl
					data={referenceTypeSchema.options.map(parseOptionsLabel).filter(option => option.value !== 'TRIP')}
					onChange={(value: string) => handleSegmentedControlChange(value as Alert['reference_type'])}
					value={alertDetailContext.data.form.values.reference_type}
					fullWidth
				/>

				{alertDetailContext.data.form.values.reference_type === 'LINE' && <AlertReferencesLines />}
				{alertDetailContext.data.form.values.reference_type === 'STOP' && <AlertReferencesStops />}
				{alertDetailContext.data.form.values.reference_type === 'AGENCY' && <AlertReferencesAgencies />}

			</Section>
		</Collapsible>
	);
}
