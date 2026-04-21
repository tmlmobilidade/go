'use client';

/* * */

import { Stop } from '@carrismetropolitana/api-types/network';
import { IconCornerDownRight, IconMinus } from '@tabler/icons-react';
import { type Alert } from '@tmlmobilidade/types';
import { Button, Grid, MultiSelect, Section, Select, type SelectDataItem, Surface } from '@tmlmobilidade/ui';
import { useMemo } from 'react';

/* * */

interface ReferencesEditorLinesItemProps {
	index: number
	lines: SelectDataItem[]
	municipalityIds: string[]
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

	const availableStops = useMemo(() => {
		if (!stops) return [];
		if (!reference.parent_id) return [];
		return stops
			.filter(stop => stop.line_ids.includes(reference.parent_id))
			.map(stop => ({ label: `[${stop.id}] ${stop.long_name}`, value: stop.id }));
	}, [stops, reference.parent_id]);

	//
	// B. Render components

	return (
		<Surface>
			<Section gap="md">

				<Grid gap="md">
					<Select
						data={lines}
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
