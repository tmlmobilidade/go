'use client';

/* * */

import { IconCornerDownRight, IconMinus } from '@tabler/icons-react';
import { type Alert, type HashedTrip, HashedTripWaypoint } from '@tmlmobilidade/types';
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

	const hashedTripsAsSelectData = useMemo(() => {
		// Skip if there are no hashedTrips
		if (!hashedTrips.length) return [];
		// Group hashedTrips by line_id, as this is the level
		// of reference we want to work with in this component.
		const uniqueLinesMap = new Map<HashedTrip['line_id'], SelectDataItem>();
		hashedTrips.forEach((item) => {
			if (uniqueLinesMap.has(item.line_id)) return;
			uniqueLinesMap.set(item.line_id, {
				label: `[${item.line_short_name}] ${item.line_long_name}`,
				value: String(item.line_id),
			});
		});
		// Return the unique lines as an array of SelectDataItem.
		return Array.from(uniqueLinesMap.values());
	}, [hashedTrips]);

	const hashedTripWaypointsAsSelectData: SelectDataItem[] = useMemo(() => {
		// Skip if there are no hashedTrips
		// or if parent_id is not set
		if (!hashedTrips?.length) return [];
		if (!reference.parent_id) return [];
		const matchingHashedTrips = hashedTrips.filter(item => String(item.line_id) === String(reference.parent_id));
		if (!matchingHashedTrips.length) return [];
		// Group hashedTripWaypoints by stop_id,
		// as we want unique stop options.
		const uniqueStopsMap = new Map<HashedTripWaypoint['stop_id'], SelectDataItem>();
		matchingHashedTrips.forEach((hashedTripItem) => {
			// Keep only the matching hashedTrips based on the selected reference.parent_id
			if (String(hashedTripItem.line_id) !== String(reference.parent_id)) return;
			// Add the waypoints of the matching hashedTrips to the uniqueStopsMap
			hashedTripItem.path.forEach((waypointItem) => {
				if (uniqueStopsMap.has(waypointItem.stop_id)) return;
				uniqueStopsMap.set(waypointItem.stop_id, {
					label: `(${hashedTripItem.pattern_id}) #${waypointItem.stop_sequence} [${waypointItem.stop_id}] ${waypointItem.stop_name}`,
					value: waypointItem.stop_id,
				});
			});
		});
		// Return the unique stops as an array of SelectDataItem.
		return Array.from(uniqueStopsMap.values());
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
							limit={200}
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
