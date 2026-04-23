'use client';

/* * */

import { IconCornerDownRight, IconMinus } from '@tabler/icons-react';
import { type Alert, type HashedTrip } from '@tmlmobilidade/types';
import { Button, Grid, MultiSelect, Section, Select, SelectDataItem, Surface } from '@tmlmobilidade/ui';
import { useMemo } from 'react';

/* * */

interface ReferencesEditorStopsItemProps {
	hashedTrips: HashedTrip[]
	index: number
	onRemoveReference: (index: number) => void
	onUpdateReference: (index: number, field: 'child_ids' | 'parent_id', value: string | string[]) => void
	reference: Alert['references'][number]
}

/* * */

export function ReferencesEditorStopsItem({ hashedTrips, index, onRemoveReference, onUpdateReference, reference }: ReferencesEditorStopsItemProps) {
	//

	//
	// A. Transform data

	const hashedTripWaypointsAsSelectData: SelectDataItem[] = useMemo(() => {
		// Transform the waypoints of all hashedTrips
		// into SelectDataItem format
		const uniqueWaypointsMap = new Map<string, SelectDataItem>();
		hashedTrips.forEach((trip) => {
			trip.path.forEach((item) => {
				if (!uniqueWaypointsMap.has(item.stop_id)) {
					uniqueWaypointsMap.set(item.stop_id, {
						label: `[${item.stop_id}] ${item.stop_name}`,
						value: item.stop_id,
					});
				}
			});
		});
		return Array.from(uniqueWaypointsMap.values());
	}, [hashedTrips]);

	const hashedTripsAsSelectData: SelectDataItem[] = useMemo(() => {
		// Skip if there are no hashedTrips
		// or if parent_id is not set
		if (!hashedTrips?.length) return [];
		if (!reference.parent_id) return [];
		// Transform hashedTrips into SelectDataItem format,
		// ensuring uniqueness by line_id.
		return hashedTrips
			.filter(item => item.path.some(waypoint => waypoint.stop_id === reference.parent_id))
			.map(item => ({
				label: String(item.line_id),
				value: String(item.line_id),
			}));
	}, [hashedTrips, reference.parent_id]);

	//
	// C. Render components

	return (
		<Surface>
			<Section gap="md">
				<Grid gap="md">
					<Select
						data={hashedTripWaypointsAsSelectData}
						label="Paragem Afetada"
						limit={25}
						onChange={value => onUpdateReference(index, 'parent_id', value)}
						onClear={() => onUpdateReference(index, 'child_ids', [])}
						value={reference.parent_id}
					/>
					<Section flexDirection="row" gap="sm" padding="none">
						<IconCornerDownRight color="var(--color-system-text-300)" size={30} />
						<MultiSelect
							data={hashedTripsAsSelectData}
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
