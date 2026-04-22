'use client';

/* * */

import { Line, Stop } from '@carrismetropolitana/api-types/network';
import { IconCornerDownRight, IconMinus } from '@tabler/icons-react';
import { type Alert } from '@tmlmobilidade/types';
import { Button, Grid, MultiSelect, Section, Select, Surface } from '@tmlmobilidade/ui';
import { useMemo } from 'react';

/* * */

interface ReferencesEditorStopsItemProps {
	index: number
	lines: Line[]
	municipalityIds: string[]
	onRemoveReference: (index: number) => void
	onUpdateReference: (index: number, field: 'child_ids' | 'parent_id', value: string | string[]) => void
	reference: Alert['references'][number]
	stops: Stop[]
}

/* * */

export function ReferencesEditorStopsItem({ index, lines, municipalityIds, onRemoveReference, onUpdateReference, reference, stops }: ReferencesEditorStopsItemProps) {
	//

	//
	// A. Transform data

	const availableStops = useMemo(() => {
		if (!stops) return [];
		return stops.map(stop => ({ label: `[${stop.id}] ${stop.long_name}`, value: stop.id }));
	}, [stops, municipalityIds]);

	const availableLines = useMemo(() => {
		if (!lines?.length) return [];
		if (!reference.parent_id) return [];
		const selectedStop = stops.find(stop => stop.id === reference.parent_id);
		if (!selectedStop?.line_ids?.length) return [];
		return selectedStop?.line_ids.map(lineId => ({
			label: `[${lineId}] ${lines.find(line => line.id === lineId)?.long_name}`,
			value: lineId,
		}));
	}, [lines, municipalityIds, reference.parent_id, stops]);

	//
	// C. Render components

	return (
		<Surface>
			<Section gap="md">
				<Grid gap="md">
					<Select
						data={availableStops}
						label="Paragem Afetada"
						limit={25}
						onChange={value => onUpdateReference(index, 'parent_id', value)}
						onClear={() => onUpdateReference(index, 'child_ids', [])}
						value={reference.parent_id}
					/>
					<Section flexDirection="row" gap="sm" padding="none">
						<IconCornerDownRight color="var(--color-system-text-300)" size={30} />
						<MultiSelect
							data={availableLines}
							description="Selecione as linhas que serão afetadas pelo alerta"
							disabled={!reference.parent_id}
							label="Linhas Afetadas"
							onChange={value => onUpdateReference(index, 'child_ids', value)}
							value={reference.child_ids}
							w="100%"
						/>
					</Section>
				</Grid>
				<Section alignItems="flex-end" padding="none">
					<Button
						icon={<IconMinus />}
						label="Remover Paragem"
						onClick={() => onRemoveReference(index)}
						variant="danger"
					/>
				</Section>
			</Section>
		</Surface>
	);

	//
}
