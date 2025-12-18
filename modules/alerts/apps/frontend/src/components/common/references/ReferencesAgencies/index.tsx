'use client';

/* * */

import { IconPlus, IconTrash } from '@tabler/icons-react';
import { Button, Combobox, Label, Section, Surface } from '@tmlmobilidade/ui';
import { useTranslation } from 'react-i18next';

import styles from './styles.module.css';

/* * */

interface Reference {
	child_ids: string[]
	parent_id: string
}

interface ReferencesAgenciesProps {
	onAddReference: () => void
	onRemoveReference: (index: number) => void
	onUpdateReference: (index: number, parent_id: string) => void
	references: Reference[]
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
	const { t } = useTranslation('global', { keyPrefix: 'components.reference_group' });

	//
	// B. Render components

	return (
		<div className={styles.container}>
			{references.length === 0 ? (
				<Surface>
					<Section>
						<Label size="md" caps>{t('no_reference_available')}</Label>
					</Section>
				</Surface>
			) : (
				references.map((reference, index) => (
					<ReferencesAgenciesItem
						key={index}
						availableAgencies={availableAgencies}
						index={index}
						onRemoveReference={onRemoveReference}
						onUpdateReference={onUpdateReference}
						reference={reference}
					/>
				))
			)}
			<Button
				className={styles.button}
				icon={<IconPlus size={18} />}
				label={t('reference_agencies.add_button_label')}
				onClick={onAddReference}
				variant="primary"
			/>
		</div>
	);

	//
}

/* * */

interface ReferencesAgenciesItemProps {
	availableAgencies: { label: string, value: string }[]
	index: number
	onRemoveReference: (index: number) => void
	onUpdateReference: (index: number, parent_id: string) => void
	reference: Reference
}

function ReferencesAgenciesItem({
	availableAgencies,
	index,
	onRemoveReference,
	onUpdateReference,
	reference,
}: ReferencesAgenciesItemProps) {
	//
	//
	// A. Setup variables

	const { t } = useTranslation('global');

	//
	// B. Render components

	return (
		<Surface>
			<Section gap="md">
				<Combobox
					aria-label={t('components.reference_group.reference_agencies.combobox_aria_label')}
					data={availableAgencies}
					label={t('components.reference_group.reference_agencies.combobox_label')}
					onChange={value => onUpdateReference(index, value || '')}
					value={reference.parent_id}
					clearable
					fullWidth
				/>
				<div className={styles.deleteButtonWrapper}>
					<Button
						className={styles.button}
						icon={<IconTrash size={18} />}
						label={t('operations.eliminate')}
						onClick={() => onRemoveReference(index)}
						variant="danger"
					/>
				</div>
			</Section>
		</Surface>
	);

	//
}
