'use client';

/* * */

import { IconCornerDownRight, IconMinus } from '@tabler/icons-react';
import { type Line, type Stop } from '@tmlmobilidade/types';
import { type Alert } from '@tmlmobilidade/types';
import { Button, Grid, MultiSelect, Section, Select, Surface } from '@tmlmobilidade/ui';
import { useMemo } from 'react';

/* * */

interface ReferencesEditorLinesItemProps {
	index: number
	lines: Line[]
	onRemoveReference: (index: number) => void
	onUpdateReference: (index: number, field: 'child_ids' | 'parent_id', value: string | string[]) => void
	reference: Alert['references'][number]
	stops: Stop[]
}

/* * */

export function ReferencesEditorLinesItem({ index, lines, onRemoveReference, onUpdateReference, reference, stops }: ReferencesEditorLinesItemProps) {
	//

	//
	// A. Transform data

	const availableLines = useMemo(() => {
		if (!lines) return [];
		return lines.map(line => ({ label: `[${line._id}] ${line.name}`, value: line._id }));
	}, [lines]);

	const availableStops = useMemo(() => {
		if (!stops) return [];
		if (!reference.parent_id) return [];
		return stops
			.map(stop => ({ label: `[${stop._id}] ${stop.name}`, value: stop._id }));
	}, [stops, reference.parent_id]);

	//
	// B. Render components

	return (
		<Surface>
			<Section gap="md">

				<Grid gap="md">
					<Select
						data={availableLines}
						label="Linha Afetada"
						limit={25}
						onChange={value => onUpdateReference(index, 'parent_id', value)}
						onClear={() => onUpdateReference(index, 'child_ids', [])}
						value={reference.parent_id}
					/>
					<Section flexDirection="row" gap="sm" padding="none">
						<IconCornerDownRight color="var(--color-system-text-300)" size={30} />
						<MultiSelect
							data={availableStops}
							description="Selecione as paragens que serão afetadas pelo alerta"
							disabled={!reference.parent_id}
							label="Paragens Afetadas"
							onChange={value => onUpdateReference(index, 'child_ids', value)}
							value={reference.child_ids}
							w="100%"
						/>
					</Section>
				</Grid>

				<Section alignItems="flex-end" padding="none">
					<Button
						icon={<IconMinus />}
						label="Remover Linha"
						onClick={() => onRemoveReference(index)}
						variant="danger"
					/>
				</Section>

			</Section>
		</Surface>
	);

	//
}
