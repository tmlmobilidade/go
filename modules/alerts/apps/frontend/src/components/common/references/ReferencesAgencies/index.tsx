'use client';

/* * */

import { IconPlus, IconTrash } from '@tabler/icons-react';
import { Button, Combobox, Label, Section, Surface } from '@tmlmobilidade/ui';

import styles from './styles.module.css';

/* * */

interface Reference {
	child_ids: string[];
	parent_id: string;
}

interface ReferencesAgenciesProps {
	onAddReference: () => void;
	onRemoveReference: (index: number) => void;
	onUpdateReference: (index: number, parent_id: string) => void;
	references: Reference[];
}

export function ReferencesAgencies({
	onAddReference,
	onRemoveReference,
	onUpdateReference,
	references,
}: ReferencesAgenciesProps) {
	//
	//
	// A. Setup variables

	const availableAgencies = [{ label: 'Carris Metropolitana', value: 'CM' }];

	//
	// B. Render components

	return (
		<div className={styles.container}>
			{references.length === 0 ? (
				<Surface>
					<Section>
						<Label size="md" caps>Não há referências disponíveis.</Label>
					</Section>
				</Surface>
			) : (
				references.map((reference, index) => (
					<ReferencesAgenciesItem
						key={index}
						index={index}
						reference={reference}
						availableAgencies={availableAgencies}
						onRemoveReference={onRemoveReference}
						onUpdateReference={onUpdateReference}
					/>
				))
			)}
			<Button
				className={styles.button}
				icon={<IconPlus size={18} />}
				label="Adicionar Rota"
				onClick={onAddReference}
				variant="primary"
			/>
		</div>
	);

	//
}

/* * */

interface ReferencesAgenciesItemProps {
	index: number;
	reference: Reference;
	availableAgencies: Array<{ label: string; value: string }>;
	onRemoveReference: (index: number) => void;
	onUpdateReference: (index: number, parent_id: string) => void;
}

function ReferencesAgenciesItem({
	index,
	reference,
	availableAgencies,
	onRemoveReference,
	onUpdateReference,
}: ReferencesAgenciesItemProps) {
	//
	//
	// A. Setup variables

	//
	// B. Render components

	return (
		<Surface>
			<Section gap="md">
				<Combobox
					aria-label="Agência Afetada"
					data={availableAgencies}
					label="Agência Afetada"
					value={reference.parent_id}
					onChange={(value) => onUpdateReference(index, value || '')}
					clearable
					fullWidth
				/>
				<div className={styles.deleteButtonWrapper}>
					<Button
						className={styles.button}
						icon={<IconTrash size={18} />}
						label="Eliminar"
						onClick={() => onRemoveReference(index)}
						variant="danger"
					/>
				</div>
			</Section>
		</Surface>
	);

	//
}

