'use client';

/* * */

import { ReferencesLines } from '@/components/common/references/ReferencesLines';
import { ReferencesStops } from '@/components/common/references/ReferencesStops';
import { type Alert, AlertReferenceTypeSchema } from '@tmlmobilidade/types';
import { Grid, Label, NoDataLabel, openConfirmModal, Section, SegmentedControl } from '@tmlmobilidade/ui';

/* * */

interface ReferencesEditorProps {
	municipalityIds?: string[]
	onSetFieldValue: <T>(path: string, value: T) => void
	references: Alert['references']
	referenceType: Alert['reference_type']
}

/* * */

export function ReferencesEditor({ municipalityIds, onSetFieldValue, references, referenceType }: ReferencesEditorProps) {
	//

	//
	// A. Handle actions

	const parseOptionsLabel = (value: Alert['reference_type']) => {
		switch (value) {
			case 'lines':
				return { label: 'Linhas', value };
			case 'rides':
				return { label: 'Circulações', value };
			case 'stops':
				return { label: 'Paragens', value };
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
				cancelProps: { variant: 'danger' },
				centered: true,
				children: <Label>Ao alterar o tipo, irá perder as referências que já foram adicionadas.</Label>,
				closeOnClickOutside: true,
				labels: { cancel: 'Cancelar', confirm: 'Continuar' },
				onConfirm: () => {
					onSetFieldValue('reference_type', value);
					onSetFieldValue('references', []);
				},
				title: 'Tem a certeza que pretende mudar de tipo de referência?',
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
					data={AlertReferenceTypeSchema.options.map(parseOptionsLabel)}
					onChange={(value: string) => handleSegmentedControlChange(value as Alert['reference_type'])}
					value={referenceType}
					fullWidth
				/>

				{referenceType === 'lines' && (
					<ReferencesLines
						municipalityIds={municipalityIds}
						onAddReference={handleAddReference}
						onRemoveReference={handleRemoveReference}
						onUpdateReference={handleUpdateReference}
						references={references}
					/>
				)}

				{referenceType === 'stops' && (
					<ReferencesStops
						municipalityIds={municipalityIds}
						onAddReference={handleAddReference}
						onRemoveReference={handleRemoveReference}
						onUpdateReference={handleUpdateReference}
						references={references}
					/>
				)}

				{referenceType === 'rides' && (
					<NoDataLabel text="under construction" />
				)}

			</Grid>
		</Section>
	);
}
