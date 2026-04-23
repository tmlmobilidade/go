'use client';

/* * */

import { IconCornerDownRight, IconMinus } from '@tabler/icons-react';
import { type Alert, type HashedTrip } from '@tmlmobilidade/types';
import { Button, Grid, MultiSelect, Section, Select, type SelectDataItem, Surface } from '@tmlmobilidade/ui';
import { useMemo } from 'react';

/* * */

interface ReferencesEditorLinesItemProps {
	hashedTrips: HashedTrip[]
	index: number
	municipalityIds: string[]
	onRemoveReference: (index: number) => void
	onUpdateReference: (index: number, field: 'child_ids' | 'parent_id', value: string | string[]) => void
	reference: Alert['references'][number]
}

/* * */

export function ReferencesEditorLinesItem({ hashedTrips, index, onRemoveReference, onUpdateReference, reference }: ReferencesEditorLinesItemProps) {
	//

	//
	// A. Transform data

	const hashedTripsAsSelectData: SelectDataItem[] = useMemo(() => {
		// Transform hashedTrips into SelectDataItem format,
		// ensuring uniqueness by line_id.
		return hashedTrips.map(item => ({
			label: `[${item.line_short_name}] ${item.line_long_name}`,
			value: String(item.line_id),
		}));
	}, [hashedTrips]);

	const hashedTripWaypointsAsSelectData: SelectDataItem[] = useMemo(() => {
		// Skip if there are no hashedTrips
		// or if parent_id is not set
		if (!hashedTrips?.length) return [];
		if (!reference.parent_id) return [];
		// Find the matching hashedTrip based on the selected reference.parent_id
		const matchingHashedTrip = hashedTrips.find(item => String(item.line_id) === String(reference.parent_id));
		if (!matchingHashedTrip) return [];
		// Transform the waypoints of the matching hashedTrip
		// into SelectDataItem format
		return matchingHashedTrip.path.map(item => ({
			label: `[${item.stop_id}] ${item.stop_name}`,
			value: item.stop_id,
		}));
	}, [hashedTrips, reference.parent_id]);

	//
	// B. Render components

	return (
		<Surface>
			<Section gap="md">

				<Grid gap="md">
					<Select
						data={hashedTripsAsSelectData}
						label="Linha Afetada"
						limit={25}
						onChange={value => onUpdateReference(index, 'parent_id', value)}
						onClear={() => onUpdateReference(index, 'child_ids', [])}
						value={reference.parent_id}
					/>
					<Section flexDirection="row" gap="sm" padding="none">
						<IconCornerDownRight color="var(--color-system-text-300)" size={30} />
						<MultiSelect
							data={hashedTripWaypointsAsSelectData}
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
