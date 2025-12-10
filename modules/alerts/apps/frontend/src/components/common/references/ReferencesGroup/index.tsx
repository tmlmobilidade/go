'use client';

/* * */

import { Alert, ReferenceType, ReferenceTypeSchema } from '@tmlmobilidade/types';
import { openConfirmModal, Section, SegmentedControl } from '@tmlmobilidade/ui';

import { ReferencesAgencies } from '../ReferencesAgencies';
import { ReferencesRoutes } from '../ReferencesRoutes';
import { ReferencesStops } from '../ReferencesStops';

/* * */

interface Reference {
	child_ids: string[]
	parent_id: string
}

interface ReferencesGroupProps {
	key: string
	municipality_ids?: string[]
	onSetFieldValue: <T>(path: string, value: T) => void
	reference_type: ReferenceType
	references: Reference[]
}

export function ReferencesGroup({
	key,
	municipality_ids,
	onSetFieldValue,
	reference_type,
	references,
}: ReferencesGroupProps) {
	//
	//
	// A. Setup variables

	//
	// B. Handle actions

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
		const currentReferences = references || [];
		currentReferences.push({ child_ids: [], parent_id: '' });
		onSetFieldValue('references', currentReferences);
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
		<Section gap="md">
			<SegmentedControl
				key={key}
				data={ReferenceTypeSchema.options.map(parseOptionsLabel).filter(option => option.value !== 'TRIP')}
				onChange={(value: string) => handleSegmentedControlChange(value as Alert['reference_type'])}
				value={reference_type}
				fullWidth
			/>

			{reference_type === 'LINE' && (
				<ReferencesRoutes
					municipality_ids={municipality_ids}
					onAddReference={handleAddReference}
					onRemoveReference={handleRemoveReference}
					onUpdateReference={handleUpdateReference}
					references={references}
				/>
			)}
			{reference_type === 'STOP' && (
				<ReferencesStops
					municipality_ids={municipality_ids}
					onAddReference={handleAddReference}
					onRemoveReference={handleRemoveReference}
					onUpdateReference={handleUpdateReference}
					references={references}
				/>
			)}
			{reference_type === 'AGENCY' && (
				<ReferencesAgencies
					onAddReference={handleAddReference}
					onRemoveReference={handleRemoveReference}
					onUpdateReference={(index, parent_id) => handleUpdateReference(index, 'parent_id', parent_id)}
					references={references}
				/>
			)}
		</Section>
	);
}
