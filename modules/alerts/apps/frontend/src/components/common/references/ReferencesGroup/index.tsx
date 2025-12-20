'use client';

/* * */

import { ReferencesAgencies } from '@/components/common/references/ReferencesAgencies';
import { ReferencesLines } from '@/components/common/references/ReferencesLines';
import { ReferencesStops } from '@/components/common/references/ReferencesStops';
import { type Alert, type ReferenceType, ReferenceTypeSchema } from '@tmlmobilidade/types';
import { Grid, openConfirmModal, Section, SegmentedControl } from '@tmlmobilidade/ui';

/* * */

interface ReferencesGroupProps {
	municipalityIds?: string[]
	onSetFieldValue: <T>(path: string, value: T) => void
	references: Alert['references']
	referenceType: ReferenceType
}

/* * */

export function ReferencesGroup({ municipalityIds, onSetFieldValue, references, referenceType }: ReferencesGroupProps) {
	//

	//
	// A. Handle actions

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

	const handleAddReference = () => {
		const updatedReferences = Array.from(references || []);
		updatedReferences.push({ child_ids: [], parent_id: '' });
		onSetFieldValue('references', updatedReferences);
	};

	const handleRemoveReference = (index: number) => {
		const currentReferences = references || [];
		onSetFieldValue('references', currentReferences.filter((_, i) => i !== index));
	};

	const handleUpdateReference = (index: number, field: 'child_ids' | 'parent_id', value: string | string[]) => {
		if (field === 'parent_id') {
			onSetFieldValue(`references.${index}.parent_id`, value as string);
		}
		else {
			onSetFieldValue(`references.${index}.child_ids`, value as string[]);
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
					onSetFieldValue('reference_type', value);
					onSetFieldValue('references', []);
				},
				title: 'Tem certeza que deseja mudar a referência?',
			});
		}
		else {
			onSetFieldValue('reference_type', value);
		}
	};

	//
	// C. Render components

	return (
		<Section padding="none">
			<Grid gap="md">

				<SegmentedControl
					data={ReferenceTypeSchema.options.map(parseOptionsLabel).filter(option => option.value !== 'TRIP')}
					onChange={(value: string) => handleSegmentedControlChange(value as Alert['reference_type'])}
					value={referenceType}
					fullWidth
				/>

				{referenceType === 'LINE' && (
					<ReferencesLines
						municipalityIds={municipalityIds}
						onAddReference={handleAddReference}
						onRemoveReference={handleRemoveReference}
						onUpdateReference={handleUpdateReference}
						references={references}
					/>
				)}

				{referenceType === 'STOP' && (
					<ReferencesStops
						municipalityIds={municipalityIds}
						onAddReference={handleAddReference}
						onRemoveReference={handleRemoveReference}
						onUpdateReference={handleUpdateReference}
						references={references}
					/>
				)}

				{referenceType === 'AGENCY' && (
					<ReferencesAgencies
						onAddReference={handleAddReference}
						onRemoveReference={handleRemoveReference}
						onUpdateReference={(index, parent_id) => handleUpdateReference(index, 'parent_id', parent_id)}
						references={references}
					/>
				)}

			</Grid>
		</Section>
	);
}
