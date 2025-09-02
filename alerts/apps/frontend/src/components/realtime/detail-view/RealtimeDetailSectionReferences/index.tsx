'use client';

/* * */

import { RealtimeReferencesAgencies } from '@/components/realtime/detail-view/RealtimeReferencesAgencies';
import { RealtimeReferencesLines } from '@/components/realtime/detail-view/RealtimeReferencesRoutes';
import { RealtimeReferencesStops } from '@/components/realtime/detail-view/RealtimeReferencesStops';
import { useRealtimeDetailContext } from '@/contexts/RealtimeDetail.context';
import { useLocationsContext } from '@/contexts/Locations.context';
import { Realtime, RealtimeSchema, referenceTypeSchema } from '@tmlmobilidade/types';
import { Collapsible, MultiSelect, openConfirmModal, Section, SegmentedControl } from '@tmlmobilidade/ui';
import { useMemo } from 'react';

/* * */

export function RealtimeDetailSectionReferences() {
	//

	//
	// A. Setup variables

	const locationsContext = useLocationsContext();
	const realtimeDetailContext = useRealtimeDetailContext();

	//
	// B. Transform data

	const municipalitiesOptions = useMemo(() => {
		if (!locationsContext.data.municipalities) return [];

		return locationsContext.data.municipalities.map(municipality => ({
			label: municipality.name,
			value: municipality.id,
		}));
	}, [locationsContext.data.municipalities]);

	const references = useMemo(() => realtimeDetailContext.data.form.values.references, [
		realtimeDetailContext.data.form.values.references,
	]);

	//
	// C. Handle actions

	const parseOptionsLabel = (value: Realtime['reference_type']) => {
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

	const handleSegmentedControlChange = (value: Realtime['reference_type']) => {
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
					realtimeDetailContext.data.form.setFieldValue('reference_type', value);
					realtimeDetailContext.data.form.setFieldValue('references', []);
				},
				title: 'Tem certeza que deseja mudar a referência?',
			});
		}
		else {
			realtimeDetailContext.data.form.setFieldValue('reference_type', value);
		}
	};

	//
	// D. Render components

	return (
		<Collapsible
			description="As referências (Linhas, Paragens, Municípios, Etc...) afetadas deste realtimea."
			title="Referências"
		>
			<Section gap="md">

				<MultiSelect
					key={realtimeDetailContext.data.form.key('municipality_ids')}
					data={municipalitiesOptions}
					description="Selecione os munícios que serão afetados pelo realtimea"
					label="Municípios Afetados"
					selected={realtimeDetailContext.data.form.values.municipality_ids}
					{...realtimeDetailContext.data.form.getInputProps('municipality_ids')}
				/>

				<SegmentedControl
					data={RealtimeSchema.shape.reference_type.options.map(parseOptionsLabel).filter(option => option.value !== referenceTypeSchema.Values.TRIP)}
					onChange={(value: string) => handleSegmentedControlChange(value as Realtime['reference_type'])}
					value={realtimeDetailContext.data.form.values.reference_type}
					fullWidth
				/>

				{realtimeDetailContext.data.form.values.reference_type === 'LINE' && <RealtimeReferencesLines />}
				{realtimeDetailContext.data.form.values.reference_type === 'STOP' && <RealtimeReferencesStops />}
				{realtimeDetailContext.data.form.values.reference_type === 'AGENCY' && <RealtimeReferencesAgencies />}

			</Section>
		</Collapsible>
	);
}
