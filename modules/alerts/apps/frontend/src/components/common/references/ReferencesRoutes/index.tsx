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

interface ReferencesRoutesProps {
	municipality_ids?: string[]
	onAddReference: () => void
	onRemoveReference: (index: number) => void
	onUpdateReference: (index: number, field: 'child_ids' | 'parent_id', value: string | string[]) => void
	references: Reference[]
}

export function ReferencesRoutes({
	municipality_ids,
	onAddReference,
	onRemoveReference,
	onUpdateReference,
	references,
}: ReferencesRoutesProps) {
	//
	// A. Setup variables

	const linesContext = useLinesContext();
	const stopsContext = useStopsContext();
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
					<ReferencesRoutesItem
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
				label={t('reference_routes.add_button_label')}
				onClick={onAddReference}
				variant="primary"
			/>
		</div>
	);

	//
}

/* * */

interface ReferencesRoutesItemProps {
	index: number
	lines: Line[]
	municipality_ids: string[]
	onRemoveReference: (index: number) => void
	onUpdateReference: (index: number, field: 'child_ids' | 'parent_id', value: string | string[]) => void
	reference: Reference
	stops: Stop[]
}

function ReferencesRoutesItem({
	index,
	lines,
	municipality_ids,
	onRemoveReference,
	onUpdateReference,
	reference,
	stops,
}: ReferencesRoutesItemProps) {
	//
	//
	// A. Setup variables

	const { t } = useTranslation('global');

	//
	// B. Transform data

	const availableLines = useMemo(() => {
		if (!lines) return [];

		if (municipality_ids.length === 0)
			return lines.map(line => ({
				label: `[${line.id}] ${line.long_name}`,
				value: line.id,
			}));

		return lines
			.filter(line =>
				line.municipality_ids.some((municipality: string) =>
					municipality_ids.includes(municipality),
				),
			)
			.map(line => ({
				label: `[${line.id}] ${line.long_name}`,
				value: line.id,
			}));
	}, [lines, municipality_ids]);

	const availableStops = useMemo(() => {
		if (!stops) return [];
		if (!reference.parent_id)
			return [];

		return stops
			.filter(stop =>
				stop.line_ids.includes(reference.parent_id),
			)
			.map(stop => ({
				label: `[${stop.id}] ${stop.long_name}`,
				value: stop.id,
			}));
	}, [
		stops,
		reference.parent_id,
	]);

	//
	// C. Render components

	return (
		<Surface>
			<Section gap="md">
				<Combobox
					aria-label={t('components.reference_group.reference_routes.combobox_aria_label')}
					data={availableLines}
					label={t('components.reference_group.reference_routes.combobox_label')}
					onChange={value => onUpdateReference(index, 'parent_id', value || '')}
					value={reference.parent_id}
					clearable
					fullWidth
					searchable
				/>
				<div className={styles.childrenWrapper}>
					<IconCornerDownRight className={styles.icon} size={28} />
					<MultiSelect
						aria-label={t('components.reference_group.reference_routes.affected_stops_aria_label')}
						data={availableStops}
						description={t('components.reference_group.reference_routes.affected_stops_description')}
						label={t('components.reference_group.reference_routes.affected_stops_label')}
						onChange={value => onUpdateReference(index, 'child_ids', value)}
						value={reference.child_ids}
					/>
				</div>
				<div className={styles.deleteButtonWrapper}>
					<Button
						className={styles.button}
						icon={<IconTrash size={18} />}
						label={t('operations.exclude')}
						onClick={() => onRemoveReference(index)}
						variant="danger"
					/>
				</div>
			</Section>
		</Surface>
	);

	//
}
