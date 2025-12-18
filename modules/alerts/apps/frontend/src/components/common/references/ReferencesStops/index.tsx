'use client';

/* * */

import { useLinesContext } from '@/contexts/Lines.context';
import { useStopsContext } from '@/contexts/Stops.context';
import { Line, Stop } from '@carrismetropolitana/api-types/network';
import { IconCornerDownRight, IconPlus, IconTrash } from '@tabler/icons-react';
import { Button, Combobox, Label, MultiSelect, Section, Surface } from '@tmlmobilidade/ui';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import styles from './styles.module.css';

/* * */

interface Reference {
	child_ids: string[]
	parent_id: string
}

interface ReferencesStopsProps {
	municipality_ids?: string[]
	onAddReference: () => void
	onRemoveReference: (index: number) => void
	onUpdateReference: (index: number, field: 'child_ids' | 'parent_id', value: string | string[]) => void
	references: Reference[]
}

export function ReferencesStops({ municipality_ids, onAddReference, onRemoveReference, onUpdateReference, references }: ReferencesStopsProps) {
	//
	//
	// A. Render components

	const linesContext = useLinesContext();
	const stopsContext = useStopsContext();
	const { t } = useTranslation('global', { keyPrefix: 'components.reference_group' });

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
					<ReferencesStopsItem
						key={index}
						index={index}
						lines={linesContext.data.lines}
						municipality_ids={municipality_ids}
						onRemoveReference={onRemoveReference}
						onUpdateReference={onUpdateReference}
						reference={reference}
						stops={stopsContext.data.stops}
					/>
				))
			)}
			<Button
				className={styles.button}
				icon={<IconPlus size={18} />}
				label={t('reference_stops.add_button_label')}
				onClick={onAddReference}
				variant="primary"
			/>
		</div>
	);

	//
}

interface ReferencesStopsItemProps {
	index: number
	lines: Line[]
	municipality_ids: string[]
	onRemoveReference: (index: number) => void
	onUpdateReference: (index: number, field: 'child_ids' | 'parent_id', value: string | string[]) => void
	reference: Reference
	stops: Stop[]
}

function ReferencesStopsItem({
	index,
	lines,
	municipality_ids,
	onRemoveReference,
	onUpdateReference,
	reference,
	stops,
}: ReferencesStopsItemProps) {
	//
	//
	// A. Setup variables

	const { t } = useTranslation('global');

	//
	// B. Transform data

	const availableStops = useMemo(() => {
		if (!stops) return [];
		if (!municipality_ids || municipality_ids.length === 0) return [];

		return stops
			.filter(stop =>
				municipality_ids.includes(stop.municipality_id),
			)
			.map(stop => ({
				label: `[${stop.id}] ${stop.long_name}`,
				value: stop.id,
			}));
	}, [stops, municipality_ids]);

	const availableRoutes = useMemo(() => {
		if (!lines) return [];
		if (!reference.parent_id)
			return [];

		const selectedStop = stops.find(
			stop =>
				stop.id === reference.parent_id,
		);
		return (
			selectedStop?.line_ids.map(lineId => ({
				label: `[${lineId}] ${
					lines.find(line => line.id === lineId)
						?.long_name
				}`,
				value: lineId,
			})) || []
		);
	}, [
		lines,
		municipality_ids,
		reference.parent_id,
		stops,
	]);

	//
	// C. Render components

	return (
		<Surface>
			<Section gap="md">
				<Combobox
					aria-label={t('components.reference_group.reference_stops.combobox_aria_label')}
					data={availableStops}
					label={t('components.reference_group.reference_stops.affected_stops_label')}
					onChange={value => onUpdateReference(index, 'parent_id', value || '')}
					placeholder={municipality_ids.length === 0 ? 'Selecione os Municípios' : 'Selecione a Paragem'}
					value={reference.parent_id}
					clearable
					fullWidth
					searchable
				/>
				<div className={styles.childrenWrapper}>
					<IconCornerDownRight className={styles.icon} size={28} />
					<MultiSelect
						aria-label={t('components.reference_group.reference_stops.affected_lines_aria_label')}
						data={availableRoutes}
						description={t('components.reference_group.reference_stops.affected_lines_description')}
						label={t('components.reference_group.reference_stops.affected_lines_label')}
						onChange={value => onUpdateReference(index, 'child_ids', value)}
						value={reference.child_ids}
					/>
				</div>
				<div className={styles.buttonContainer}>
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
